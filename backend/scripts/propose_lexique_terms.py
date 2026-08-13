#!/usr/bin/env python3
"""Propose des termes à ajouter au lexique, en se servant de l'embedding.

L'idée vient du retour d'un praticien : ne pas utiliser la recherche vectorielle
pour *chercher*, mais pour *construire le dictionnaire*. Quand le gate lexical ne
reconnaît aucun terme d'une question alors que la passe vectorielle ramène des
passages pertinents, le terme discriminant de ces passages est précisément
l'alias qui manquait au lexique. On l'ajoute, et la fois suivante le système sait
statuer sur ce terme.

Le pont, c'est le point clé
---------------------------
On ne propose pas n'importe quel mot rare des passages : on ne retient que ceux
qui font le lien entre la QUESTION et les PASSAGES (présents dans les deux, à la
variation morphologique près). Un terme du corpus absent de la question ne sert
à rien pour le gating — il n'aurait pas aidé à reconnaître la question.

Semi-supervisé par construction
-------------------------------
Le script n'écrit JAMAIS dans `corpus/lexique.yaml`. Il produit un fichier de
propositions, chacune accompagnée de la question déclenchante et de l'article
justificatif, pour qu'un juriste valide en lisant la source. C'est ce qui rend le
lexique défendable : chaque terme y est entré par une décision humaine tracée.

Usage :
  cd backend
  PYTHONPATH=. python3 scripts/propose_lexique_terms.py                    # gold set
  PYTHONPATH=. python3 scripts/propose_lexique_terms.py --questions q.txt  # une par ligne
  PYTHONPATH=. python3 scripts/propose_lexique_terms.py --top-k 8 --max-terms 5
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.rag.gate import GateReason, evaluate  # noqa: E402
from src.rag.lexique import get_lexique, normalize, stem_fr, tokens  # noqa: E402

# Réutilise les filtres de bruit de l'amorçage : mêmes exclusions, même notion
# de terme « utile », pour que les deux scripts restent cohérents.
from scripts.bootstrap_lexique import _is_noise, load_chunks  # noqa: E402


def _corpus_document_frequency(rows: list[dict[str, Any]]) -> tuple[Counter, int]:
    """Nombre de chunks contenant chaque terme (df), et total de chunks."""
    df: Counter = Counter()
    for r in rows:
        seen = {t for t in tokens(r.get("contenu") or "") if not _is_noise(t)}
        df.update(seen)
    return df, len(rows)


def _known_stems() -> set[str]:
    """Racines déjà couvertes par le lexique — inutile de les reproposer."""
    lex = get_lexique()
    known: set[str] = set()
    for d in lex.domaines:
        for t in d.termes:
            if " " in t or "'" in t:
                continue
            known.add(stem_fr(t))
    return known


def _bridge_terms(
    question: str,
    passages: list[dict[str, Any]],
    df: Counter,
    n_chunks: int,
    known: set[str],
    *,
    max_terms: int,
) -> list[tuple[str, float]]:
    """Termes faisant le pont entre la question et les passages remontés.

    Score `tf(passages) × idf(corpus)` : fréquent dans ce que le vectoriel a
    jugé pertinent, rare dans le corpus entier — donc discriminant.
    """
    q_stems = {stem_fr(t) for t in tokens(question) if not _is_noise(t)}
    if not q_stems:
        return []

    tf: Counter = Counter()
    for p in passages:
        tf.update(t for t in tokens(p.get("text") or "") if not _is_noise(t))
    if not tf:
        return []

    scored: dict[str, tuple[str, float]] = {}
    for term, n in tf.items():
        st = stem_fr(term)
        # Le pont : le terme doit être dans la question ET dans les passages.
        if st not in q_stems or st in known:
            continue
        d = df.get(term, 0)
        if d < 2:  # hapax : probablement une coquille d'OCR
            continue
        score = n * math.log(n_chunks / d)
        # Une entrée par racine, on garde la forme la plus courte (la plus
        # proche du lemme) et le meilleur score.
        prev = scored.get(st)
        if prev is None or score > prev[1] or (score == prev[1] and len(term) < len(prev[0])):
            scored[st] = (term, score)

    out = sorted(scored.values(), key=lambda x: -x[1])
    return out[:max_terms]


def _dominant_domain(passages: list[dict[str, Any]]) -> tuple[str | None, float]:
    """Domaine majoritaire des passages, et sa part (indice de confiance)."""
    counts: Counter = Counter()
    for p in passages:
        meta = p.get("metadata") if isinstance(p.get("metadata"), dict) else {}
        dom = meta.get("domaine")
        if dom:
            counts[dom] += 1
    if not counts:
        return None, 0.0
    dom, n = counts.most_common(1)[0]
    return dom, n / sum(counts.values())


def _justifying_article(passages: list[dict[str, Any]], term: str) -> dict[str, Any] | None:
    """Premier passage contenant le terme — la source que le juriste relira."""
    n = normalize(term)
    for p in passages:
        if n in normalize(p.get("text") or ""):
            meta = p.get("metadata") if isinstance(p.get("metadata"), dict) else {}
            return {
                "code": meta.get("code"),
                "article": meta.get("numero_article"),
                "extrait": (p.get("text") or "").strip()[:220],
            }
    return None


def _load_questions(args) -> list[str]:
    if args.questions:
        return [
            ln.strip()
            for ln in args.questions.read_text(encoding="utf-8").splitlines()
            if ln.strip() and not ln.startswith("#")
        ]
    data = yaml.safe_load(args.gold.read_text(encoding="utf-8")) or {}
    return [q.get("question", "") for q in data.get("questions", []) if q.get("question")]


def main() -> None:
    ap = argparse.ArgumentParser(description="Propose des alias pour le lexique.")
    ap.add_argument("--gold", type=Path, default=ROOT / "evals" / "gold_set.yaml")
    ap.add_argument("--questions", type=Path, help="Fichier texte, une question par ligne.")
    ap.add_argument("--jsonl", type=Path, default=ROOT / "data" / "articles_ingest.jsonl")
    ap.add_argument("--out", type=Path, default=ROOT / "corpus" / "lexique.propositions.yaml")
    ap.add_argument("--top-k", type=int, default=6, help="Passages examinés par question.")
    ap.add_argument("--max-terms", type=int, default=4, help="Propositions par question.")
    ap.add_argument(
        "--min-domain-share",
        type=float,
        default=0.5,
        help="Part minimale du domaine majoritaire pour retenir une proposition.",
    )
    args = ap.parse_args()

    if not args.jsonl.exists():
        print(f"[erreur] corpus introuvable : {args.jsonl}", file=sys.stderr)
        sys.exit(1)

    from src.rag import retriever  # import tardif : charge le modèle d'embedding

    questions = _load_questions(args)
    rows = load_chunks(args.jsonl)
    df, n_chunks = _corpus_document_frequency(rows)
    known = _known_stems()

    print(f"== Enrichissement du lexique — {len(questions)} questions ==\n")

    proposals: dict[str, list[dict[str, Any]]] = defaultdict(list)
    n_examined = 0

    for q in questions:
        decision = evaluate(q)
        # On ne s'intéresse QU'aux questions dont le lexique ne dit rien. Les
        # refus prouvés n'ont pas à être enrichis — les enrichir reviendrait à
        # apprendre au système à accepter ce qu'il doit refuser.
        if decision.reason is not GateReason.NO_TERM_RECOGNIZED:
            continue
        n_examined += 1

        passages = retriever.search_expanded(q, domaine=None)[: args.top_k]
        if not passages:
            print(f"  [—] {q[:64]}… : aucun passage")
            continue

        dom, share = _dominant_domain(passages)
        if not dom or share < args.min_domain_share:
            print(f"  [?] {q[:64]}… : domaine incertain ({dom}, {share:.0%})")
            continue

        terms = _bridge_terms(q, passages, df, n_chunks, known, max_terms=args.max_terms)
        if not terms:
            print(f"  [—] {q[:64]}… : aucun terme-pont")
            continue

        print(f"  [+] {q[:64]}…")
        for term, score in terms:
            print(f"        → {term}  (domaine {dom}, {share:.0%}, score {score:.1f})")
            proposals[dom].append(
                {
                    "terme": term,
                    "score": round(score, 2),
                    "domaine_confiance": round(share, 2),
                    "question": q,
                    "justification": _justifying_article(passages, term),
                }
            )

    header = (
        "# Propositions d'alias pour corpus/lexique.yaml — À VALIDER À LA MAIN.\n"
        "#\n"
        "# Généré par scripts/propose_lexique_terms.py. Chaque terme vient d'une\n"
        "# question que le lexique ne reconnaissait pas, mais pour laquelle la\n"
        "# recherche vectorielle a ramené des passages cohérents.\n"
        "#\n"
        "# Pour valider : relire l'article justificatif, et si le terme est bien\n"
        "# caractéristique du domaine, le reporter dans corpus/lexique.yaml.\n"
        "# Ne JAMAIS copier ce fichier tel quel : c'est une liste de candidats,\n"
        "# pas une liste de termes validés.\n"
    )
    payload = {"propositions": {dom: proposals[dom] for dom in sorted(proposals)}}
    args.out.write_text(
        header + yaml.safe_dump(payload, allow_unicode=True, sort_keys=False, width=100),
        encoding="utf-8",
    )

    total = sum(len(v) for v in proposals.values())
    print(f"\n  {n_examined} question(s) sans terme reconnu → {total} proposition(s)")
    print(f"  → {args.out.relative_to(ROOT)}")
    if total:
        print("  → à relire par un juriste avant report dans corpus/lexique.yaml")


if __name__ == "__main__":
    main()
