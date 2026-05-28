#!/usr/bin/env python3
"""Évalue la qualité du retrieval RAG contre le gold set YAML.

Lit backend/evals/gold_set.yaml, appelle retriever.search() pour chaque
entrée, calcule Recall@5, Recall@10, MRR, NDCG@10, top-1 hit rate.

Sorties :
  backend/evals/last_run.md   — rapport lisible (écrase à chaque run)
  backend/evals/last_run.json — métriques JSON (pratique pour scripting)
  backend/evals/history.md    — append-only, une section par run

Usage :
  cd backend
  PYTHONPATH=. python3 scripts/eval_retrieval.py
  PYTHONPATH=. python3 scripts/eval_retrieval.py --gold evals/gold_set.yaml --k 5 10
  PYTHONPATH=. python3 scripts/eval_retrieval.py --no-threshold  # recall brut sans seuil
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.rag import retriever  # noqa: E402


# ── helpers métriques ────────────────────────────────────────────────────────

def _norm(num: str) -> str:
    return " ".join(str(num).strip().lower().split())


def _returned_articles(rows: list[dict[str, Any]]) -> list[str]:
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
    topk = set(got[:k])
    return len(expected & topk) / len(expected)


def _precision_at_k(expected: set[str], got: list[str], k: int) -> float:
    topk = got[:k]
    if not topk:
        return 0.0
    return sum(1 for g in topk if g in expected) / len(topk)


def _mrr(expected: set[str], got: list[str]) -> float:
    if not expected:
        return 0.0
    for i, g in enumerate(got, start=1):
        if g in expected:
            return 1.0 / i
    return 0.0


def _dcg_at_k(expected: set[str], got: list[str], k: int) -> float:
    score = 0.0
    for i, g in enumerate(got[:k], start=1):
        rel = 1.0 if g in expected else 0.0
        score += rel / math.log2(i + 1)
    return score


def _ndcg_at_k(expected: set[str], got: list[str], k: int) -> float:
    if not expected:
        return 1.0
    ideal = sorted([1.0] * min(len(expected), k) + [0.0] * max(0, k - len(expected)), reverse=True)
    idcg = sum(rel / math.log2(i + 2) for i, rel in enumerate(ideal))
    if idcg < 1e-9:
        return 0.0
    return _dcg_at_k(expected, got, k) / idcg


def _top1_hit(expected: set[str], got: list[str]) -> bool:
    return bool(got) and got[0] in expected


# ── chargement gold set ──────────────────────────────────────────────────────

def _load_gold(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data.get("questions", [])


# ── rendu rapport ────────────────────────────────────────────────────────────

def _render_md(
    cases: list[dict],
    results: list[dict],
    ks: list[int],
    label: str,
    no_threshold: bool,
) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines: list[str] = [
        f"## {label} — {ts}",
        "",
        f"Gold set : {len(cases)} questions  |  seuil rag_min_score : {'ignoré' if no_threshold else 'appliqué'}",
        "",
    ]

    in_domain = [r for r in results if r["type"] == "in_domain"]
    cross = [r for r in results if r["type"] == "cross"]

    # Tableau par question
    header_cols = ["id", "domaine", "diff"] + [f"R@{k}" for k in ks] + ["MRR", "NDCG@10", "top1", "got[:5]"]
    lines.append("### Détail par question\n")
    lines.append("| " + " | ".join(header_cols) + " |")
    lines.append("| " + " | ".join(["---"] * len(header_cols)) + " |")
    for r in in_domain:
        row = [
            r["id"],
            r["domaine"],
            r["difficulty"],
        ] + [f"{r['recalls'][k]:.2f}" for k in ks] + [
            f"{r['mrr']:.2f}",
            f"{r['ndcg10']:.2f}",
            "✓" if r["top1"] else "✗",
            ", ".join(r["got"][:5]) or "—",
        ]
        lines.append("| " + " | ".join(row) + " |")

    # Récap cross-domaine
    if cross:
        lines.append("\n### Cross-domaine (attendu : vide après seuil)\n")
        lines.append("| id | domaine | diff | renvoyés | ok |")
        lines.append("| --- | --- | --- | --- | --- |")
        for r in cross:
            mark = "✓" if r["empty"] else "✗"
            lines.append(f"| {r['id']} | {r['domaine']} | {r['difficulty']} | {r['n_returned']} | {mark} |")

    # Récap global par domaine
    dom_stats: dict[str, dict] = defaultdict(lambda: {k: [] for k in ["mrr", "ndcg10", "top1"] + [f"R@{k}" for k in ks]})
    for r in in_domain:
        d = r["domaine"]
        dom_stats[d]["mrr"].append(r["mrr"])
        dom_stats[d]["ndcg10"].append(r["ndcg10"])
        dom_stats[d]["top1"].append(float(r["top1"]))
        for k in ks:
            dom_stats[d][f"R@{k}"].append(r["recalls"][k])

    lines.append("\n### Récap par domaine\n")
    dom_header = ["domaine", "n"] + [f"R@{k}" for k in ks] + ["MRR", "NDCG@10", "top1"]
    lines.append("| " + " | ".join(dom_header) + " |")
    lines.append("| " + " | ".join(["---"] * len(dom_header)) + " |")

    glob: dict[str, list] = defaultdict(list)
    for dom in sorted(dom_stats):
        s = dom_stats[dom]
        n = len(s["mrr"])
        cells = [dom, str(n)]
        for k in ks:
            v = sum(s[f"R@{k}"]) / n
            cells.append(f"{v:.2f}")
            glob[f"R@{k}"].append(v)
        cells.append(f"{sum(s['mrr'])/n:.2f}")
        cells.append(f"{sum(s['ndcg10'])/n:.2f}")
        cells.append(f"{sum(s['top1'])/n:.2f}")
        glob["mrr"] += s["mrr"]
        glob["ndcg10"] += s["ndcg10"]
        glob["top1"] += s["top1"]
        lines.append("| " + " | ".join(cells) + " |")

    # Ligne GLOBAL
    n_glob = len(in_domain)
    if n_glob:
        cells = ["**GLOBAL**", str(n_glob)]
        for k in ks:
            cells.append(f"**{sum(glob[f'R@{k}'])/len(glob[f'R@{k}']):.2f}**")
        cells.append(f"**{sum(glob['mrr'])/len(glob['mrr']):.2f}**")
        cells.append(f"**{sum(glob['ndcg10'])/len(glob['ndcg10']):.2f}**")
        cells.append(f"**{sum(glob['top1'])/len(glob['top1']):.2f}**")
        lines.append("| " + " | ".join(cells) + " |")

    if cross:
        n_ok = sum(1 for r in cross if r["empty"])
        lines.append(f"\nCross-domaine correctement vides : **{n_ok}/{len(cross)}**")

    return "\n".join(lines)


def _build_json(results: list[dict], ks: list[int]) -> dict:
    in_domain = [r for r in results if r["type"] == "in_domain"]
    cross = [r for r in results if r["type"] == "cross"]
    global_metrics: dict = {}
    for k in ks:
        vals = [r["recalls"][k] for r in in_domain]
        global_metrics[f"recall@{k}"] = sum(vals) / len(vals) if vals else 0.0
    mrr_vals = [r["mrr"] for r in in_domain]
    ndcg_vals = [r["ndcg10"] for r in in_domain]
    top1_vals = [float(r["top1"]) for r in in_domain]
    global_metrics["mrr"] = sum(mrr_vals) / len(mrr_vals) if mrr_vals else 0.0
    global_metrics["ndcg@10"] = sum(ndcg_vals) / len(ndcg_vals) if ndcg_vals else 0.0
    global_metrics["top1_hit_rate"] = sum(top1_vals) / len(top1_vals) if top1_vals else 0.0
    cross_ok = sum(1 for r in cross if r["empty"])
    return {
        "global": global_metrics,
        "cross_domain_empty_rate": cross_ok / len(cross) if cross else None,
        "n_in_domain": len(in_domain),
        "n_cross": len(cross),
        "details": results,
    }


# ── main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(description="Évaluation retrieval RAG (gold set YAML).")
    ap.add_argument("--gold", type=Path, default=ROOT / "evals" / "gold_set.yaml")
    ap.add_argument("--k", type=int, nargs="+", default=[5, 10])
    ap.add_argument(
        "--no-threshold",
        action="store_true",
        help="Ignore rag_min_score (mesure le recall brut du ranking).",
    )
    ap.add_argument("--label", default="Baseline", help="Titre de la section dans history.md.")
    args = ap.parse_args()

    if not args.gold.exists():
        print(f"[erreur] gold set introuvable : {args.gold}", file=sys.stderr)
        sys.exit(1)

    cases = _load_gold(args.gold)
    ks = sorted(args.k)
    max_k = max(ks)

    results: list[dict] = []

    print(f"== Éval retrieval — {len(cases)} questions ==")
    print(f"   seuil rag_min_score : {'IGNORÉ' if args.no_threshold else 'appliqué'}\n")

    for c in cases:
        qid = c.get("id", "?")
        question = c.get("question", "")
        domaine = c.get("expected_domain") or c.get("domaine") or None
        expected_raw: list = c.get("expected_articles") or []
        difficulty = c.get("difficulty", "?")
        is_cross = len(expected_raw) == 0

        if args.no_threshold:
            rows = retriever.search_expanded(question, domaine=domaine)
        else:
            rows = retriever.search(question, domaine=domaine)

        got = _returned_articles(rows)

        if is_cross:
            ok = len(rows) == 0
            mark = "✓" if ok else "✗"
            print(f"  [{mark}] {qid:<30} ({domaine or '?':<18} {difficulty:<6}) cross → renvoyés={len(rows)}")
            results.append({
                "id": qid,
                "domaine": domaine or "?",
                "difficulty": difficulty,
                "type": "cross",
                "empty": ok,
                "n_returned": len(rows),
                "got": got[:5],
            })
        else:
            expected = {_norm(x) for x in expected_raw}
            recalls = {k: _recall_at_k(expected, got, k) for k in ks}
            mrr = _mrr(expected, got)
            ndcg10 = _ndcg_at_k(expected, got, 10)
            top1 = _top1_hit(expected, got)
            mark = "✓" if top1 else "✗"
            recall_str = "  ".join(f"R@{k}={recalls[k]:.2f}" for k in ks)
            print(f"  [{mark}] {qid:<30} ({domaine or '?':<18} {difficulty:<6}) {recall_str}  MRR={mrr:.2f}  NDCG@10={ndcg10:.2f}")
            results.append({
                "id": qid,
                "domaine": domaine or "?",
                "difficulty": difficulty,
                "type": "in_domain",
                "recalls": recalls,
                "mrr": mrr,
                "ndcg10": ndcg10,
                "top1": top1,
                "got": got[:max_k],
                "expected": list(expected),
            })

    # Métriques globales résumées
    in_domain = [r for r in results if r["type"] == "in_domain"]
    cross = [r for r in results if r["type"] == "cross"]
    if in_domain:
        print("\n== Métriques globales ==")
        for k in ks:
            avg = sum(r["recalls"][k] for r in in_domain) / len(in_domain)
            print(f"   Recall@{k}    : {avg:.3f}")
        mrr_avg = sum(r["mrr"] for r in in_domain) / len(in_domain)
        ndcg_avg = sum(r["ndcg10"] for r in in_domain) / len(in_domain)
        top1_avg = sum(float(r["top1"]) for r in in_domain) / len(in_domain)
        print(f"   MRR          : {mrr_avg:.3f}")
        print(f"   NDCG@10      : {ndcg_avg:.3f}")
        print(f"   Top-1 hit    : {top1_avg:.3f}")
    if cross:
        n_ok = sum(1 for r in cross if r["empty"])
        print(f"   Cross vides  : {n_ok}/{len(cross)}")

    # Écriture des sorties
    evals_dir = ROOT / "evals"
    evals_dir.mkdir(exist_ok=True)

    md_content = _render_md(cases, results, ks, args.label, args.no_threshold)
    (evals_dir / "last_run.md").write_text(md_content + "\n", encoding="utf-8")

    json_data = _build_json(results, ks)
    (evals_dir / "last_run.json").write_text(
        json.dumps(json_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # Append dans history.md
    history_path = evals_dir / "history.md"
    with history_path.open("a", encoding="utf-8") as f:
        f.write("\n" + md_content + "\n")

    print(f"\n  → evals/last_run.md + evals/last_run.json écrits")
    print(f"  → evals/history.md mis à jour")


if __name__ == "__main__":
    main()
