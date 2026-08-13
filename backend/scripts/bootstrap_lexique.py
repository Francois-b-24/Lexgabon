#!/usr/bin/env python3
"""Amorce le vocabulaire positif du lexique depuis le corpus indexé.

Pourquoi ce script : rédiger à la main le vocabulaire des 7 codes indexés
représenterait des jours de travail. Le corpus contient déjà ce vocabulaire —
il suffit de l'extraire. On calcule, pour chaque domaine, les termes qui lui
sont *discriminants* (fréquents ici, rares ailleurs), ce qui donne le
vocabulaire à forte valeur de gating.

Ce que ce script ne fait PAS, volontairement :
  - il n'écrit jamais dans `corpus/lexique.yaml` (le fichier vivant, édité par
    un juriste), mais dans `corpus/lexique.bootstrap.yaml` ;
  - il ne produit aucun terme pour les domaines NON indexés — par définition
    ils n'ont aucun chunk dans le corpus. Leur lexique négatif est écrit à la
    main, et c'est le composant le plus sensible du dispositif (un terme trop
    générique y provoque un refus sur une question légitime).

Source : `data/articles_ingest.jsonl` (les 3277 chunks en clair). On ne passe
pas par Chroma : pas de modèle d'embedding à charger, exécution en ~2 s.

Usage :
  cd backend
  PYTHONPATH=. python3 scripts/bootstrap_lexique.py
  PYTHONPATH=. python3 scripts/bootstrap_lexique.py --top 200 --min-df 3
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Tokenisation alignée sur celle du retriever (`_WORD_RE`), pour que les termes
# extraits ici soient exactement ceux que le gate retrouvera à l'exécution.
_WORD_RE = re.compile(r"[a-zàâäéèêëïîôùûüçœæ0-9]+")

# ── bruit à écarter ──────────────────────────────────────────────────────────
# Trois familles observées sur ce corpus précis.

_MOIS = {
    "janvier", "fevrier", "février", "mars", "avril", "mai", "juin", "juillet",
    "aout", "août", "septembre", "octobre", "novembre", "decembre", "décembre",
}

# Ordinaux latins de la numérotation juridique (« article 12 quinquies ») :
# très discriminants statistiquement, sans aucune valeur de gating.
_ORDINAUX_LATINS = {
    "bis", "ter", "quater", "quinquies", "sexies", "septies", "octies",
    "nonies", "decies", "undecies", "duodecies",
}

# Vocabulaire juridique transverse : présent partout, donc sans pouvoir
# discriminant, mais que l'IDF laisse parfois passer sur les petits domaines.
_STOP_JURIDIQUE = {
    "article", "articles", "loi", "lois", "code", "codes", "titre", "chapitre",
    "section", "alinea", "alinéa", "present", "présent", "presente", "présente",
    "presentes", "présentes", "dispositions", "disposition", "conditions",
    "condition", "cas", "lieu", "fait", "faire", "droit", "droits", "date",
    "vigueur", "decret", "décret", "arrete", "arrêté", "ordonnance", "republique",
    "république", "gabonaise", "gabon", "ministre", "ministere", "ministère",
    "etat", "état", "journal", "officiel", "publication", "abroge", "abrogé",
    "modifie", "modifié", "conformement", "conformément", "notamment", "toutefois",
}

_STOP_FR = {
    "dans", "pour", "par", "sur", "avec", "sans", "sous", "les", "des", "une",
    "aux", "est", "sont", "etre", "être", "ont", "peut", "doit", "dont", "qui",
    "que", "quoi", "cette", "cet", "ces", "son", "ses", "leur", "leurs", "plus",
    "tout", "tous", "toute", "toutes", "autre", "autres", "meme", "même", "ainsi",
    "lors", "selon", "apres", "après", "avant", "entre", "chaque", "alors", "donc",
    "mais", "car", "ne", "pas", "elle", "ils", "elles", "nous", "vous", "leurs",
    "celui", "celle", "ceux", "celles", "dernier", "derniere", "dernière",
}

_NOISE = _MOIS | _ORDINAUX_LATINS | _STOP_JURIDIQUE | _STOP_FR


def _strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def _is_noise(term: str) -> bool:
    """Écarte le bruit non porteur de sens juridique."""
    if len(term) <= 3:
        return True
    if term.isdigit() or any(c.isdigit() for c in term):
        return True
    if term in _NOISE or _strip_accents(term) in _NOISE:
        return True
    return False


def _tokens(text: str) -> list[str]:
    return _WORD_RE.findall((text or "").lower())


# ── extraction ───────────────────────────────────────────────────────────────

def load_chunks(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def discriminant_terms(
    rows: list[dict[str, Any]],
    *,
    top: int,
    min_df: int,
    max_domaines: int,
) -> dict[str, list[tuple[str, float]]]:
    """Termes discriminants par domaine, score `fréquence relative × IDF`.

    La fréquence est *relative* au domaine et non absolue : sans cela, les gros
    domaines écraseraient les petits. Le corpus est très déséquilibré (impots
    1000 chunks, communication 59), donc la normalisation n'est pas cosmétique.

    Le filtre `max_domaines` écarte les termes présents dans presque tous les
    codes : ils ne discriminent rien même quand leur fréquence est élevée.
    """
    per_domain_counts: dict[str, Counter] = defaultdict(Counter)
    for r in rows:
        dom = r.get("domaine")
        if not dom:
            continue
        per_domain_counts[dom].update(t for t in _tokens(r.get("contenu") or "") if not _is_noise(t))

    n_domaines = len(per_domain_counts)
    # Nombre de domaines où le terme apparaît (df « documentaire » au sens domaine)
    domain_freq: Counter = Counter()
    for counts in per_domain_counts.values():
        domain_freq.update(counts.keys())

    out: dict[str, list[tuple[str, float]]] = {}
    for dom, counts in per_domain_counts.items():
        total = sum(counts.values()) or 1
        scored: list[tuple[str, float]] = []
        for term, n in counts.items():
            if n < min_df:
                continue
            nd = domain_freq[term]
            if nd > max_domaines or nd >= n_domaines:
                continue
            score = (n / total) * math.log(n_domaines / nd)
            scored.append((term, score))
        scored.sort(key=lambda x: -x[1])
        out[dom] = scored[:top]
    return out


def load_manifest_codes(path: Path) -> dict[str, dict[str, str]]:
    """Mapping `domaine -> {code, slug}` depuis le manifest (source de vérité)."""
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    files = data.get("files") or {}
    out: dict[str, dict[str, str]] = {}
    for meta in files.values():
        dom = meta.get("domaine")
        if dom:
            out[dom] = {"code": meta.get("code", ""), "slug": meta.get("slug", "")}
    return out


def build_yaml(
    terms_by_domain: dict[str, list[tuple[str, float]]],
    codes: dict[str, dict[str, str]],
) -> str:
    lines: list[str] = [
        "# Vocabulaire positif AMORCÉ AUTOMATIQUEMENT — ne pas éditer ce fichier.",
        "#",
        "# Généré par scripts/bootstrap_lexique.py depuis data/articles_ingest.jsonl.",
        "# À relire par un juriste, puis à reporter dans corpus/lexique.yaml (le",
        "# fichier vivant). Les termes sont classés par pouvoir discriminant",
        "# décroissant : les premiers sont les plus sûrs pour le gating.",
        "#",
        "# Ce fichier ne couvre QUE les domaines indexés. Le lexique négatif des",
        "# domaines absents du corpus (civil, pénal, famille…) ne peut pas être",
        "# amorcé et doit être écrit à la main dans corpus/lexique.yaml.",
        "",
        "domaines:",
    ]
    for dom in sorted(terms_by_domain):
        meta = codes.get(dom, {})
        lines.append(f"  {dom}:")
        lines.append("    indexed: true")
        if meta.get("code"):
            lines.append(f"    code: {json.dumps(meta['code'], ensure_ascii=False)}")
        if meta.get("slug"):
            lines.append(f"    slug: {json.dumps(meta['slug'], ensure_ascii=False)}")
        lines.append("    termes:")
        for term, score in terms_by_domain[dom]:
            lines.append(f"      - {json.dumps(term, ensure_ascii=False):<24}  # {score:.5f}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser(description="Amorce le vocabulaire positif du lexique.")
    ap.add_argument("--jsonl", type=Path, default=ROOT / "data" / "articles_ingest.jsonl")
    ap.add_argument("--manifest", type=Path, default=ROOT / "corpus" / "pdfs" / "manifest.yaml")
    ap.add_argument("--out", type=Path, default=ROOT / "corpus" / "lexique.bootstrap.yaml")
    ap.add_argument("--top", type=int, default=150, help="Termes retenus par domaine.")
    ap.add_argument("--min-df", type=int, default=3, help="Occurrences minimales dans le domaine.")
    ap.add_argument(
        "--max-domaines",
        type=int,
        default=4,
        help="Écarte les termes présents dans plus de N domaines (non discriminants).",
    )
    args = ap.parse_args()

    if not args.jsonl.exists():
        print(f"[erreur] corpus introuvable : {args.jsonl}", file=sys.stderr)
        print("         (re-générer via scripts/ingest_pdfs.py)", file=sys.stderr)
        sys.exit(1)

    rows = load_chunks(args.jsonl)
    codes = load_manifest_codes(args.manifest) if args.manifest.exists() else {}
    terms = discriminant_terms(
        rows, top=args.top, min_df=args.min_df, max_domaines=args.max_domaines
    )

    args.out.write_text(build_yaml(terms, codes), encoding="utf-8")

    print(f"== Amorçage du lexique — {len(rows)} chunks, {len(terms)} domaines ==\n")
    for dom in sorted(terms):
        head = ", ".join(t for t, _ in terms[dom][:8])
        print(f"  {dom:<15} {len(terms[dom]):>3} termes  |  {head}")
    print(f"\n  → {args.out.relative_to(ROOT)} écrit")
    print("  → à relire par un juriste, puis reporter dans corpus/lexique.yaml")


if __name__ == "__main__":
    main()
