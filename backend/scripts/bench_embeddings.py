#!/usr/bin/env python3
"""Benchmark comparatif d'embeddings pour le RAG LexGabon (étape 3).

Pour chaque modèle candidat :
  1. Crée une collection Chroma temporaire dans data/chroma_bench/<model_slug>/
  2. Ré-ingère tous les PDF du corpus avec ce modèle
  3. Lance eval_retrieval sur la collection temporaire
  4. Affiche un tableau comparatif et écrit le résultat dans evals/history.md

Les collections temporaires sont réutilisées si elles existent déjà (idempotent).
La collection de production (data/chroma / droit_gabonais) n'est jamais modifiée.

Usage :
  cd backend
  PYTHONPATH=. python3 scripts/bench_embeddings.py
  PYTHONPATH=. python3 scripts/bench_embeddings.py --models e5-small e5-base
  PYTHONPATH=. python3 scripts/bench_embeddings.py --models e5-small e5-base bge-m3 --reset
"""
from __future__ import annotations

import argparse
import hashlib
import logging
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.rag.pdf_parser import chunks_from_pdf  # noqa: E402

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

MODELS: dict[str, dict] = {
    "e5-small": {
        "name": "intfloat/multilingual-e5-small",
        "dim": 384,
        "note": "baseline — léger, CPU Render OK",
        "e5_prefix": True,
    },
    "e5-base": {
        "name": "intfloat/multilingual-e5-base",
        "dim": 768,
        "note": "compromis qualité/RAM (~280 MB)",
        "e5_prefix": True,
    },
    "bge-m3": {
        "name": "BAAI/bge-m3",
        "dim": 1024,
        "note": "meilleur multilingue, fenêtre 8192 tokens (~2.3 GB)",
        "e5_prefix": False,
    },
}

BENCH_DIR = ROOT / "data" / "chroma_bench"


# ── ingestion helpers ────────────────────────────────────────────────────────

def _file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(65536), b""):
            h.update(block)
    return h.hexdigest()


def _source_key(rel_posix: str) -> str:
    return hashlib.sha256(rel_posix.encode()).hexdigest()[:32]


def _load_manifest(base: Path) -> dict[str, dict]:
    path = base / "manifest.yaml"
    if not path.is_file():
        return {}
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    files = raw.get("files") if isinstance(raw, dict) else None
    return {str(k): (v if isinstance(v, dict) else {}) for k, v in (files or {}).items()}


def _citation_for(meta: dict, numero: str | None, default_label: str) -> str:
    code = (meta.get("code") or meta.get("titre") or default_label).strip()
    ref = (meta.get("reference") or "").strip()
    base = f"{code} — Article {numero}" if numero else code
    if ref and ref not in base:
        base = f"{base} ({ref})"
    return base


def ingest_to_collection(col: Any, manifest: dict, pdf_dir: Path, ef: Any) -> int:
    """Ingère tous les PDF dans col (idempotent par source_key). Retourne le nb de chunks."""
    pdfs = sorted(pdf_dir.rglob("*.pdf"))
    seen_hashes: set[str] = set()
    total = 0
    for pdf_path in pdfs:
        rel = pdf_path.relative_to(pdf_dir).as_posix()
        file_meta = manifest.get(rel, {}) or manifest.get(pdf_path.name, {}) or {}
        if file_meta.get("duplicate_of"):
            continue
        digest = _file_hash(pdf_path)
        if digest in seen_hashes:
            continue
        seen_hashes.add(digest)

        sk = _source_key(rel)
        text_id = file_meta.get("slug") or rel.replace(".pdf", "")

        # Idempotent : supprimer les anciens chunks de cette source
        try:
            existing = col.get(where={"source_key": sk}, include=[])
            if existing.get("ids"):
                col.delete(ids=existing["ids"])
        except Exception:
            pass

        data = pdf_path.read_bytes()
        extraction_mode = file_meta.get("extraction_mode", "plain")
        chunks = chunks_from_pdf(data, extraction_mode=extraction_mode)

        ids, docs, metas = [], [], []
        for i, c in enumerate(chunks):
            num = c.numero_article
            cit = _citation_for(file_meta, num, text_id)
            meta: dict[str, Any] = {
                "source_key": sk,
                "kind": "corpus_pdf",
                "text_id": text_id,
                "citation": cit,
            }
            for key in ("titre", "code", "autorite", "date", "reference", "domaine"):
                v = file_meta.get(key)
                if isinstance(v, str) and v.strip():
                    meta[key] = v.strip()[:500]
            if num:
                meta["numero_article"] = num.strip()[:32]
            chunk_id = f"{sk}:{i}"
            ids.append(chunk_id)
            docs.append(c.text)
            metas.append(meta)

        if ids:
            col.add(ids=ids, documents=docs, metadatas=metas)
            total += len(ids)
            logger.info("  %s : %d chunks", rel, len(ids))
    return total


# ── eval helpers (inlined depuis eval_retrieval pour éviter import circulaire) ─

def _norm(num: str) -> str:
    return " ".join(str(num).strip().lower().split())


def _returned_articles(rows: list[dict]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for r in rows:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        num = meta.get("numero_article")
        if not num:
            continue
        n = _norm(num)
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


def _recall_at_k(expected: set[str], got: list[str], k: int) -> float:
    if not expected:
        return 1.0
    return len(expected & set(got[:k])) / len(expected)


def _mrr(expected: set[str], got: list[str]) -> float:
    for i, g in enumerate(got, 1):
        if g in expected:
            return 1.0 / i
    return 0.0


def _ndcg_at_k(expected: set[str], got: list[str], k: int) -> float:
    import math
    if not expected:
        return 1.0
    ideal = sorted([1.0] * min(len(expected), k) + [0.0] * max(0, k - len(expected)), reverse=True)
    idcg = sum(r / math.log2(i + 2) for i, r in enumerate(ideal))
    if idcg < 1e-9:
        return 0.0
    dcg = sum((1.0 if g in expected else 0.0) / math.log2(i + 2) for i, g in enumerate(got[:k]))
    return dcg / idcg


def run_eval(col: Any, ef: Any, gold_path: Path, ks: list[int]) -> dict:
    """Lance l'éval retrieval sur une collection donnée. Retourne les métriques globales."""
    from src.rag.embedding import E5EmbeddingFunction, embed_query_text
    from src.rag.retriever import _hybrid_rescore, _rows_from_chroma_result

    data = yaml.safe_load(gold_path.read_text(encoding="utf-8"))
    cases = [c for c in data.get("questions", []) if c.get("expected_articles")]

    recall_sums = {k: 0.0 for k in ks}
    mrr_sum = 0.0
    ndcg_sum = 0.0
    top1_sum = 0.0

    for c in cases:
        question = c["question"]
        expected = {_norm(x) for x in c["expected_articles"]}
        k_fetch = max(ks) * 2

        q_vec = embed_query_text(ef, question)
        try:
            res = col.query(query_embeddings=[q_vec], n_results=k_fetch)
        except Exception as e:
            logger.warning("query failed: %s", e)
            continue

        rows = _rows_from_chroma_result(res, k_fetch)
        rows = _hybrid_rescore(rows, question, max(ks))
        got = _returned_articles(rows)

        for k in ks:
            recall_sums[k] += _recall_at_k(expected, got, k)
        mrr_sum += _mrr(expected, got)
        ndcg_sum += _ndcg_at_k(expected, got, 10)
        top1_sum += float(bool(got) and got[0] in expected)

    n = len(cases)
    if n == 0:
        return {}
    return {
        **{f"recall@{k}": recall_sums[k] / n for k in ks},
        "mrr": mrr_sum / n,
        "ndcg@10": ndcg_sum / n,
        "top1": top1_sum / n,
        "n": n,
    }


# ── main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(description="Benchmark embeddings RAG (étape 3).")
    ap.add_argument(
        "--models", nargs="+", default=["e5-small", "e5-base"],
        choices=list(MODELS.keys()),
        help="Modèles à comparer (défaut: e5-small e5-base ; ajouter bge-m3 si RAM ≥ 4 GB).",
    )
    ap.add_argument("--reset", action="store_true", help="Supprime et recrée les collections de benchmark.")
    ap.add_argument("--gold", type=Path, default=ROOT / "evals" / "gold_set.yaml")
    ap.add_argument("--k", type=int, nargs="+", default=[5, 10])
    args = ap.parse_args()

    import chromadb
    from src.rag.embedding import make_embedding_function

    pdf_dir = ROOT / "corpus" / "pdfs"
    manifest = _load_manifest(pdf_dir)
    gold_path = args.gold
    ks = sorted(args.k)
    BENCH_DIR.mkdir(parents=True, exist_ok=True)

    results: dict[str, dict] = {}

    for slug in args.models:
        cfg = MODELS[slug]
        model_name = cfg["name"]
        bench_path = str(BENCH_DIR / slug)

        print(f"\n{'='*60}")
        print(f"  Modèle : {model_name}")
        print(f"  Note   : {cfg['note']}")
        print(f"  Chroma : {bench_path}")
        print(f"{'='*60}")

        try:
            ef = make_embedding_function(model_name)
        except Exception as e:
            print(f"  [SKIP] chargement impossible : {e}")
            continue

        client = chromadb.PersistentClient(path=bench_path)
        col_name = f"bench_{slug}"

        if args.reset:
            try:
                client.delete_collection(col_name)
                logger.info("collection %s supprimée", col_name)
            except Exception:
                pass

        col = client.get_or_create_collection(
            name=col_name,
            embedding_function=ef,
            metadata={"hnsw:space": "cosine"},
        )

        existing_count = col.count()
        if existing_count == 0:
            print(f"  Ingestion en cours...")
            t0 = time.time()
            n_chunks = ingest_to_collection(col, manifest, pdf_dir, ef)
            elapsed = time.time() - t0
            print(f"  {n_chunks} chunks ingérés en {elapsed:.1f}s")
        else:
            print(f"  Collection existante : {existing_count} chunks (passer --reset pour réingérer)")

        print(f"  Évaluation...")
        t0 = time.time()
        metrics = run_eval(col, ef, gold_path, ks)
        elapsed = time.time() - t0
        metrics["eval_time_s"] = round(elapsed, 1)
        results[slug] = metrics
        print(f"  Recall@5={metrics.get('recall@5', 0):.3f}  Recall@10={metrics.get('recall@10', 0):.3f}  "
              f"MRR={metrics.get('mrr', 0):.3f}  NDCG@10={metrics.get('ndcg@10', 0):.3f}  "
              f"top1={metrics.get('top1', 0):.3f}  ({elapsed:.1f}s)")

    # Tableau comparatif
    print(f"\n{'='*60}")
    print("  TABLEAU COMPARATIF")
    print(f"{'='*60}")
    header = f"  {'modèle':<12} {'R@5':>6} {'R@10':>6} {'MRR':>6} {'NDCG@10':>8} {'top1':>6}  note"
    print(header)
    print("  " + "-" * (len(header) - 2))
    best_slug = max(results, key=lambda s: results[s].get("ndcg@10", 0)) if results else None
    for slug, m in results.items():
        marker = " ◀ BEST" if slug == best_slug else ""
        print(f"  {slug:<12} {m.get('recall@5', 0):>6.3f} {m.get('recall@10', 0):>6.3f} "
              f"{m.get('mrr', 0):>6.3f} {m.get('ndcg@10', 0):>8.3f} {m.get('top1', 0):>6.3f}"
              f"  {MODELS[slug]['note']}{marker}")

    # Append history.md
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    evals_dir = ROOT / "evals"
    evals_dir.mkdir(exist_ok=True)
    history_path = evals_dir / "history.md"

    lines = [
        f"\n## Étape 3 — Benchmark embeddings — {ts}\n",
        "| modèle | dim | R@5 | R@10 | MRR | NDCG@10 | top1 | note |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for slug, m in results.items():
        cfg = MODELS[slug]
        marker = " ◀" if slug == best_slug else ""
        lines.append(
            f"| {slug}{marker} | {cfg['dim']} | {m.get('recall@5', 0):.3f} | {m.get('recall@10', 0):.3f} | "
            f"{m.get('mrr', 0):.3f} | {m.get('ndcg@10', 0):.3f} | {m.get('top1', 0):.3f} | {cfg['note']} |"
        )
    if best_slug:
        lines.append(f"\nMeilleur modèle retenu : **{best_slug}** ({MODELS[best_slug]['name']})")

    with history_path.open("a", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\n  → evals/history.md mis à jour")

    if best_slug:
        print(f"\n  Meilleur modèle : {best_slug} ({MODELS[best_slug]['name']})")
        print(f"  Pour l'activer en production : CHROMA_EMBEDDING_MODEL={MODELS[best_slug]['name']}")
        print(f"  Puis réingérer : PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates")


if __name__ == "__main__":
    main()
