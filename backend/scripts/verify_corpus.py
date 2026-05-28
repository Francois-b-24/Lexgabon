#!/usr/bin/env python3
"""Audit de la collection Chroma : volume, articles, sources, alertes.

Usage : cd backend && PYTHONPATH=. python3 scripts/verify_corpus.py
"""
from __future__ import annotations

import argparse
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import chromadb  # noqa: E402

from src.config import get_settings  # noqa: E402
from src.rag.embedding import make_embedding_function  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit de la collection Chroma LexGabon.")
    parser.add_argument("--top", type=int, default=15, help="Nombre de sources affichées dans le top")
    parser.add_argument(
        "--query",
        type=str,
        default="préavis de licenciement d'un cadre",
        help="Question test pour vérifier que la recherche renvoie quelque chose de pertinent",
    )
    args = parser.parse_args()

    s = get_settings()
    ef = make_embedding_function(s.chroma_embedding_model)
    client = chromadb.PersistentClient(path=s.chroma_path)
    col = client.get_or_create_collection(
        name=s.chroma_collection,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    total = col.count()
    print(f"Collection : {s.chroma_collection}  ·  chemin : {s.chroma_path}")
    print(f"Total chunks : {total}")
    if total == 0:
        print("\nCollection VIDE. Lancez :")
        print("  PYTHONPATH=. python3 scripts/ingest_pdfs.py --skip-duplicates")
        print("  PYTHONPATH=. python3 scripts/fetch_official_sources.py")
        print("  PYTHONPATH=. python3 scripts/ingest_chroma.py --jsonl data/scraped_chunks.jsonl")
        sys.exit(0)

    # Charge toutes les métadonnées (page par page si gros volume).
    data = col.get(include=["metadatas"])
    metas = data.get("metadatas") or []

    sources_count: Counter[str] = Counter()
    articles: set[tuple[str, str]] = set()  # (source, numero)
    no_article = 0
    kinds: Counter[str] = Counter()

    for m in metas:
        m = m or {}
        label = (
            m.get("code")
            or m.get("titre")
            or m.get("source_filename")
            or m.get("fetch_source_id")
            or "(inconnu)"
        )
        sources_count[str(label)] += 1
        num = m.get("numero_article")
        if isinstance(num, str | int | float) and str(num).strip():
            articles.add((str(label), str(num).strip()))
        else:
            no_article += 1
        kind = m.get("kind") or ("fetch" if m.get("fetch_source_id") else "autre")
        kinds[str(kind)] += 1

    print(f"Articles distincts (source, numero) : {len(articles)}")
    pct = (100 * (total - no_article) / total) if total else 0.0
    print(f"Chunks avec numero_article : {total - no_article}/{total} ({pct:.0f} %)")
    print(f"Répartition par kind : {dict(kinds)}")

    print(f"\nTop {args.top} sources par volume de chunks :")
    for label, n in sources_count.most_common(args.top):
        print(f"  {n:5d}  {label[:80]}")

    # Alertes
    alerts: list[str] = []
    if pct < 60:
        alerts.append(
            f"Moins de 60 % des chunks portent un numero_article ({pct:.0f}%). Le chunking article-aware "
            "ne s'applique probablement pas à toutes les sources : vérifiez que les PDFs sont bien des "
            "codes/lois numérotés et que le scraping HTML conserve la structure."
        )
    if total < 1000:
        alerts.append(
            f"Volume très faible ({total} chunks). Un corpus juridique sérieux dépasse plusieurs milliers "
            "de chunks. Ajoutez les codes principaux dans backend/corpus/pdfs/ et étendez sources.yaml."
        )

    if alerts:
        print("\nAlertes :")
        for a in alerts:
            print(f"  ! {a}")
    else:
        print("\nAucune alerte.")

    # Requête test (préfixe « query: » E5 calculé côté retriever pour cohérence)
    print(f"\nRequête test : « {args.query} »")
    try:
        from src.rag.embedding import embed_query_text  # noqa: E402

        res = col.query(query_embeddings=[embed_query_text(ef, args.query)], n_results=5)
        ids = (res.get("ids") or [[]])[0]
        metas_q = (res.get("metadatas") or [[]])[0]
        docs = (res.get("documents") or [[]])[0]
        if not ids:
            print("  Aucun résultat retourné.")
        for i, _id in enumerate(ids):
            md = metas_q[i] if i < len(metas_q) else {}
            doc_preview = (docs[i] if i < len(docs) else "")[:120].replace("\n", " ")
            cit = md.get("citation") if isinstance(md, dict) else None
            print(f"  {i+1}. {cit or _id}")
            print(f"     {doc_preview}…")
    except Exception as e:
        print(f"  Erreur requête : {e}")


if __name__ == "__main__":
    main()
