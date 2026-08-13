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
from src.rag.gate import evaluate as gate_evaluate  # noqa: E402


# ── helpers métriques ────────────────────────────────────────────────────────

def _norm(num: str) -> str:
    return " ".join(str(num).strip().lower().split())


def _norm_code(code: str | None) -> str:
    """Normalise un nom de code pour comparaison (accents conservés, casse/espaces non)."""
    return " ".join(str(code or "").strip().lower().split())


def _key(code: str | None, num: str) -> str:
    """Clé de matching `code|article`.

    Sans le code, le matching est quasi non informatif : 809 des 909 numéros
    d'article du corpus apparaissent dans plusieurs codes (les articles 1 à 8
    existent dans les 7 codes indexés). Un chunk « Article 12 » du CGI comptait
    donc comme succès pour une question attendant l'article 12 du Code du
    travail. Quand le gold set ne précise pas de code, on retombe sur le
    matching par numéro nu (rétro-compatibilité).
    """
    c = _norm_code(code)
    return f"{c}|{_norm(num)}" if c else _norm(num)


def _expected_keys(expected_raw: list, default_code: str | None) -> set[str]:
    """Accepte deux formes de gold set.

    - chaîne nue : "149"                       → code repris de `expected_code`
    - mapping    : {code: "…", article: "149"} → code explicite par entrée
    """
    out: set[str] = set()
    for x in expected_raw:
        if isinstance(x, dict):
            out.add(_key(x.get("code") or default_code, x.get("article") or x.get("numero") or ""))
        else:
            out.add(_key(default_code, x))
    return out


def _returned_articles(rows: list[dict[str, Any]]) -> list[str]:
    """Clés `code|article` des chunks renvoyés, dédupliquées, ordre conservé."""
    out: list[str] = []
    seen: set[str] = set()
    for r in rows:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        num = meta.get("numero_article")
        if not num:
            continue
        n = _key(meta.get("code"), num)
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


def _returned_articles_bare(rows: list[dict[str, Any]]) -> list[str]:
    """Variante sans code — sert à mesurer l'écart avec l'ancien matching."""
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


def _reason_matches(row: dict[str, Any]) -> bool:
    """Le motif obtenu figure-t-il parmi les motifs acceptables ?

    Plusieurs motifs peuvent être également justes selon la formulation : une
    question sur « le droit civil » peut légitimement sortir en
    `domain_not_indexed` (la matière) ou `code_not_indexed` (le texte nommé).
    D'où une liste attendue plutôt qu'une valeur unique.
    """
    expected = row.get("expected_reason")
    if not expected:
        return False
    if isinstance(expected, str):
        expected = [expected]
    return row.get("gate_reason") in set(expected)


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

    # ── Métriques de tête ────────────────────────────────────────────────────
    # Le recall in-domain mesure la qualité du ranking ; il ne dit rien de la
    # capacité à PROUVER une absence. C'est cross_domain_empty_rate qui la
    # mesure, d'où sa place en tête. in_domain_blocked_rate est la contrainte
    # dure associée : refuser du hors-périmètre ne vaut que si l'on ne refuse
    # jamais une question légitime.
    if cross or in_domain:
        n_ok = sum(1 for r in cross if r["empty"])
        n_blocked = sum(1 for r in in_domain if r.get("blocked"))
        rate = n_ok / len(cross) if cross else 0.0
        blocked_rate = n_blocked / len(in_domain) if in_domain else 0.0
        lines.append("### Métriques de tête\n")
        lines.append("| métrique | valeur | cible |")
        lines.append("| --- | --- | --- |")
        lines.append(f"| **cross_domain_empty_rate** | **{n_ok}/{len(cross)} ({rate:.2f})** | ≥ 0.95 |")
        lines.append(f"| **in_domain_blocked_rate** | **{n_blocked}/{len(in_domain)} ({blocked_rate:.2f})** | 0.00 (dur) |")
        # Ventilation par raison : un refus juste pour un mauvais motif est un
        # faux positif déguisé.
        reasons = [r for r in cross if r.get("expected_reason")]
        if reasons and any(r.get("gate_reason") for r in reasons):
            n_right = sum(1 for r in reasons if _reason_matches(r))
            lines.append(f"| cross_domain_right_reason | {n_right}/{len(reasons)} ({n_right/len(reasons):.2f}) | ≥ 0.875 |")
        lines.append("")

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
        lines.append("\n### Hors-périmètre (attendu : aucun extrait)\n")
        lines.append("| id | domaine | raison attendue | raison obtenue | renvoyés | ok |")
        lines.append("| --- | --- | --- | --- | --- | --- |")
        for r in cross:
            mark = "✓" if r["empty"] else "✗"
            exp = r.get("expected_reason") or []
            exp_r = " / ".join(exp) if isinstance(exp, list) else str(exp)
            got_r = r.get("gate_reason") or "—"
            if r.get("gate_reason") and not _reason_matches(r):
                got_r = f"**{got_r}**"
            lines.append(
                f"| {r['id']} | {r['domaine']} | {exp_r} | {got_r} | {r['n_returned']} | {mark} |"
            )

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
    # Recall mesuré à l'ancienne (numéro d'article nu, sans le code) — conservé
    # pour objectiver l'écart avec l'historique, PAS pour piloter les décisions.
    bare_metrics: dict = {}
    for k in ks:
        vals = [r["recalls_bare"][k] for r in in_domain if "recalls_bare" in r]
        if vals:
            bare_metrics[f"recall@{k}"] = sum(vals) / len(vals)

    # in_domain_blocked_rate : proportion de questions in-domain que le gate a
    # bloquées. Contrainte dure du projet : doit rester à 0.00. Tant que le gate
    # n'est pas branché, aucune question n'est bloquée.
    blocked = sum(1 for r in in_domain if r.get("blocked"))
    with_reason = [r for r in cross if r.get("expected_reason") and r.get("gate_reason")]
    right_reason = sum(1 for r in with_reason if _reason_matches(r))
    return {
        # ── métriques de tête ────────────────────────────────────────────────
        "cross_domain_empty_rate": cross_ok / len(cross) if cross else None,
        "in_domain_blocked_rate": blocked / len(in_domain) if in_domain else 0.0,
        "cross_domain_right_reason": (right_reason / len(with_reason)) if with_reason else None,
        # ── métriques de retrieval ───────────────────────────────────────────
        "global": global_metrics,
        # Recall sur les seules questions dont la réponse est réellement dans le
        # corpus : c'est la mesure qui reflète la qualité du moteur.
        "global_reachable": {
            f"recall@{k}": (
                sum(r["recalls"][k] for r in in_domain if not r.get("known_gap"))
                / max(1, len([r for r in in_domain if not r.get("known_gap")]))
            )
            for k in ks
        },
        "n_known_gap": len([r for r in in_domain if r.get("known_gap")]),
        "global_bare_article_match": bare_metrics,
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
    ap.add_argument(
        "--no-gate",
        dest="gate",
        action="store_false",
        help="Désactive le gate lexical (mesure le retrieval seul).",
    )
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

        # Le gate est évalué SANS le domaine du gold set : en production le
        # sélecteur front est le plus souvent vide, et c'est précisément là que
        # le refus doit fonctionner. L'évaluer avec le domaine déclaré
        # surestimerait ses performances.
        decision = gate_evaluate(question) if args.gate else None

        if decision is not None and decision.blocking:
            rows = []
        elif args.no_threshold:
            rows = retriever.search_expanded(question, domaine=domaine)
        else:
            rows = retriever.search(question, domaine=domaine)

        got = _returned_articles(rows)
        got_bare = _returned_articles_bare(rows)

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
                "expected_reason": c.get("expected_reason"),
                "gate_reason": decision.reason.value if decision else None,
                "gate_terms": list(decision.matched_terms) if decision else [],
            })
        else:
            expected = _expected_keys(expected_raw, c.get("expected_code"))
            recalls = {k: _recall_at_k(expected, got, k) for k in ks}
            mrr = _mrr(expected, got)
            ndcg10 = _ndcg_at_k(expected, got, 10)
            top1 = _top1_hit(expected, got)
            # Même mesure sans le code : l'écart quantifie les faux positifs
            # que l'ancien matching par numéro nu comptait comme succès.
            expected_bare = {_norm(x.get("article") or x.get("numero") or "") if isinstance(x, dict) else _norm(x)
                             for x in expected_raw}
            recalls_bare = {k: _recall_at_k(expected_bare, got_bare, k) for k in ks}
            mark = "✓" if top1 else "✗"
            recall_str = "  ".join(f"R@{k}={recalls[k]:.2f}" for k in ks)
            print(f"  [{mark}] {qid:<30} ({domaine or '?':<18} {difficulty:<6}) {recall_str}  MRR={mrr:.2f}  NDCG@10={ndcg10:.2f}")
            results.append({
                "id": qid,
                "domaine": domaine or "?",
                "difficulty": difficulty,
                "type": "in_domain",
                # `known_gap` : l'article attendu est absent du corpus, ou noyé
                # dans un chunk géant. L'échec ne vient pas du ranking, donc la
                # question est comptée à part — sinon on optimiserait le moteur
                # contre un plafond qu'il ne peut pas franchir.
                "known_gap": bool(c.get("known_gap")),
                "annotation_note": c.get("annotation_note"),
                # Contrainte dure : doit rester False partout. Une question
                # légitime bloquée est le pire échec possible du dispositif.
                "blocked": bool(decision and decision.blocking),
                "gate_reason": decision.reason.value if decision else None,
                "recalls": recalls,
                "recalls_bare": recalls_bare,
                "mrr": mrr,
                "ndcg10": ndcg10,
                "top1": top1,
                "got": got[:max_k],
                "expected": sorted(expected),
            })

    # Métriques globales résumées
    in_domain = [r for r in results if r["type"] == "in_domain"]
    cross = [r for r in results if r["type"] == "cross"]
    print("\n== Métriques de tête ==")
    if cross:
        n_ok = sum(1 for r in cross if r["empty"])
        print(f"   cross_domain_empty_rate : {n_ok}/{len(cross)} ({n_ok/len(cross):.2f})   cible ≥ 0.95")
    if in_domain:
        n_blocked = sum(1 for r in in_domain if r.get("blocked"))
        print(f"   in_domain_blocked_rate  : {n_blocked}/{len(in_domain)} ({n_blocked/len(in_domain):.2f})   cible 0.00 (dur)")

    reachable = [r for r in in_domain if not r.get("known_gap")]
    gaps = [r for r in in_domain if r.get("known_gap")]
    if gaps:
        print(f"\n== Hors portée du moteur : {len(gaps)} question(s) ==")
        for r in gaps:
            print(f"   {r['id']:<30} {r.get('annotation_note') or ''}")

    if reachable:
        print(f"\n== Métriques sur corpus atteignable ({len(reachable)} q) ==")
        for k in ks:
            avg = sum(r["recalls"][k] for r in reachable) / len(reachable)
            print(f"   Recall@{k}    : {avg:.3f}")
        print(f"   MRR          : {sum(r['mrr'] for r in reachable)/len(reachable):.3f}")

    if in_domain:
        print("\n== Métriques globales, toutes questions (matching code|article) ==")
        for k in ks:
            avg = sum(r["recalls"][k] for r in in_domain) / len(in_domain)
            bare_vals = [r["recalls_bare"][k] for r in in_domain if "recalls_bare" in r]
            if bare_vals:
                bare = sum(bare_vals) / len(bare_vals)
                print(f"   Recall@{k}    : {avg:.3f}   (ancien matching n° nu : {bare:.3f})")
            else:
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
