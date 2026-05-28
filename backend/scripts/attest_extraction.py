#!/usr/bin/env python3
"""Atteste la FIDÉLITÉ de l'extraction PDF → texte indexé.

Pour un échantillon d'articles (aléatoire reproductible via --seed, ou ciblé via
--article), confronte le texte réellement indexé (data/articles_ingest.jsonl) au
texte brut relu directement dans le PDF source, à son VRAI en-tête d'article
(même regex + même filtre de références internes que le chunker).

Sortie : pour chaque article, un score de similarité [0..1] entre l'indexé et le
PDF, et un drapeau si le score est sous le seuil (--min-sim). Un récapitulatif
indique le taux d'articles « fidèles ». Optionnellement (--report FICHIER), écrit
un rapport texte côte-à-côte pour relecture humaine.

Ce script NE PROUVE PAS que le texte dit fidèlement la loi (il faudrait la source
officielle) : il prouve que ce qui est indexé == ce que pypdf lit dans le PDF, sans
corruption/perte introduite par notre pipeline de chunking.

Usage :
  cd backend && PYTHONPATH=. python3 scripts/attest_extraction.py
  ... --n 30 --seed 1 --report data/attestation.txt
  ... --article douane:115 --article impots:10
"""
from __future__ import annotations

import argparse
import json
import random
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import yaml  # noqa: E402

from src.rag.chunking import (  # noqa: E402
    _ARTICLE_HEADER_RE,
    _is_internal_reference,
    normalize_pdf_text,
)
from src.rag.pdf_parser import extract_pdf_pages  # noqa: E402

ARTICLES_JSONL = ROOT / "data" / "articles_ingest.jsonl"
MANIFEST = ROOT / "corpus" / "pdfs" / "manifest.yaml"
PDF_DIR = ROOT / "corpus" / "pdfs"


def _load_manifest() -> dict[str, dict]:
    raw = yaml.safe_load(MANIFEST.read_text(encoding="utf-8")) or {}
    files = raw.get("files") if isinstance(raw, dict) else None
    return {str(k): (v or {}) for k, v in (files or {}).items()}


def _slug_to_pdf(manifest: dict[str, dict]) -> dict[str, tuple[str, str]]:
    """slug -> (nom_fichier_pdf, extraction_mode)."""
    out: dict[str, tuple[str, str]] = {}
    for fname, meta in manifest.items():
        slug = str(meta.get("slug") or Path(fname).stem)
        out[slug] = (fname, str(meta.get("extraction_mode") or "plain"))
    return out


def _norm_num(num: str) -> str:
    return re.sub(r"\s+", " ", str(num).strip().lower())


def find_header_match(norm_text: str, numero: str):
    """Trouve le vrai en-tête d'article `numero` dans un texte normalisé (filtre les réfs internes)."""
    target = _norm_num(numero)
    for m in _ARTICLE_HEADER_RE.finditer(norm_text):
        num = _norm_num(m.group("num") or m.group("num2") or "")
        if num == target and not _is_internal_reference(norm_text, m.start()):
            return m
    return None


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def _squash(s: str) -> str:
    """Réduit aux lettres/chiffres minuscules : neutralise espaces parasites, ponctuation, casse.

    Permet d'aligner même quand le PDF a des espaces résiduels (« tempsde », « L e »)
    différents de l'indexé : on compare la substance, pas la mise en forme.
    """
    return re.sub(r"[^0-9a-zàâäéèêëïîôùûüç]", "", s.lower())


def best_pdf_alignment(full_pdf: str, indexed: str, compare_chars: int) -> tuple[float, str]:
    """Cherche dans TOUT le texte PDF le passage correspondant au début de l'indexé.

    Robuste à la renumérotation (plusieurs « Article N » par PDF) ET aux espaces
    parasites : on aligne sur une ANCRE distinctive (squash du début d'indexé)
    retrouvée dans le squash du PDF, puis on re-projette pour extraire la fenêtre
    lisible et on score. Si l'indexé vient du PDF, sim ≈ 1.
    """
    needle = indexed[:compare_chars]
    if not needle:
        return 0.0, ""

    sq_pdf = _squash(full_pdf)
    sq_needle = _squash(needle)
    # Ancre = préfixe distinctif (premiers ~60 caractères « substance »).
    anchor = sq_needle[:60]
    if not anchor:
        return 0.0, ""
    pos = sq_pdf.find(anchor)
    if pos < 0:
        # Repli : plus longue sous-chaîne commune sur la version squashée (tolère
        # une ancre qui démarre quelques mots plus loin).
        sm = SequenceMatcher(None, sq_pdf, sq_needle)
        m = sm.find_longest_match(0, len(sq_pdf), 0, len(sq_needle))
        if m.size < 20:
            return 0.0, ""  # vraiment introuvable → signal légitime
        pos = m.a - m.b if m.a - m.b >= 0 else m.a

    # Re-projeter la position « squashée » vers le texte original : on avance dans
    # full_pdf en comptant les caractères de substance jusqu'à atteindre `pos`.
    orig_start = _project(full_pdf, pos)
    window = full_pdf[orig_start: orig_start + len(needle) + 40]
    # Score sur la substance (insensible aux espaces parasites de mise en page).
    return similarity(sq_needle, _squash(window)[: len(sq_needle)]), window


def _project(text: str, squashed_index: int) -> int:
    """Position dans `text` correspondant au n-ième caractère de substance (squash)."""
    count = 0
    for i, ch in enumerate(text):
        if re.match(r"[0-9a-zàâäéèêëïîôùûüç]", ch.lower()):
            if count == squashed_index:
                return i
            count += 1
    return len(text)


def main() -> None:
    ap = argparse.ArgumentParser(description="Atteste la fidélité extraction PDF → index.")
    ap.add_argument("--n", type=int, default=21, help="Nombre d'articles échantillonnés (réparti sur les codes).")
    ap.add_argument("--seed", type=int, default=0, help="Graine aléatoire (reproductibilité).")
    ap.add_argument("--min-sim", type=float, default=0.92, help="Seuil de similarité en dessous duquel on signale.")
    ap.add_argument("--compare-chars", type=int, default=400, help="Longueur comparée (début d'article).")
    ap.add_argument("--article", action="append", default=[], help="Cible un article précis « domaine:numero » (répétable).")
    ap.add_argument("--report", type=Path, default=None, help="Écrit un rapport côte-à-côte relisible.")
    args = ap.parse_args()

    if not ARTICLES_JSONL.exists():
        print(f"introuvable : {ARTICLES_JSONL} (lancer ingest_pdfs.py d'abord)", file=sys.stderr)
        sys.exit(1)

    rows = [json.loads(l) for l in ARTICLES_JSONL.read_text(encoding="utf-8").splitlines() if l.strip()]
    manifest = _load_manifest()
    slug_map = _slug_to_pdf(manifest)

    # Sélection des articles à attester.
    by_dom: dict[str, list[dict]] = {}
    for r in rows:
        by_dom.setdefault(r.get("domaine") or "?", []).append(r)

    selected: list[dict] = []
    if args.article:
        wanted = {tuple(a.split(":", 1)) for a in args.article}
        for r in rows:
            if (r.get("domaine"), str(r.get("numero"))) in wanted:
                selected.append(r)
    else:
        rng = random.Random(args.seed)
        per = max(1, args.n // max(len(by_dom), 1))
        for dom, items in sorted(by_dom.items()):
            pick = rng.sample(items, min(per, len(items)))
            selected.extend(pick)

    # Cache du texte PDF complet normalisé par slug.
    full_cache: dict[str, str | None] = {}

    def full_pdf_for(slug: str) -> str | None:
        if slug in full_cache:
            return full_cache[slug]
        if slug not in slug_map:
            full_cache[slug] = None
            return None
        fname, mode = slug_map[slug]
        pdf_path = PDF_DIR / fname
        if not pdf_path.is_file():
            full_cache[slug] = None
            return None
        raw_pages = extract_pdf_pages(pdf_path.read_bytes(), extraction_mode=mode)
        full_cache[slug] = normalize_pdf_text("\n".join(raw_pages))
        return full_cache[slug]

    report_lines: list[str] = []
    n_ok = n_flag = n_notfound = 0
    print(f"== Attestation extraction — {len(selected)} articles (seuil sim ≥ {args.min_sim:.2f}) ==\n")

    for r in sorted(selected, key=lambda x: (x.get("domaine") or "", str(x.get("numero")))):
        dom = r.get("domaine") or "?"
        num = str(r.get("numero"))
        slug = str(r.get("texte_slug") or "")
        indexed = (r.get("contenu") or "").strip()
        full_pdf = full_pdf_for(slug)
        if full_pdf is None:
            print(f"  [?]  {dom:<13} art.{num:<6} PDF introuvable pour slug={slug}")
            n_notfound += 1
            continue

        sim, b = best_pdf_alignment(full_pdf, indexed, args.compare_chars)
        a = indexed[: args.compare_chars]
        if sim >= args.min_sim:
            n_ok += 1
            mark = "✓"
        else:
            n_flag += 1
            mark = "⚠"
        print(f"  [{mark}]  {dom:<13} art.{num:<6} sim={sim:.3f}")

        if args.report is not None:
            report_lines.append("=" * 78)
            report_lines.append(f"{dom} · article {num} · slug={slug} · sim={sim:.3f} {'OK' if sim>=args.min_sim else 'À RELIRE'}")
            report_lines.append("--- INDEXÉ (ce que voit le chatbot) " + "-" * 30)
            report_lines.append(a)
            report_lines.append("--- PDF BRUT (à confronter au document source) " + "-" * 18)
            report_lines.append(b)
            report_lines.append("")

    total = n_ok + n_flag
    print("\n== Récapitulatif ==")
    print(f"  fidèles (sim ≥ {args.min_sim:.2f}) : {n_ok}/{total}")
    print(f"  à relire (sim < seuil)        : {n_flag}/{total}")
    if n_notfound:
        print(f"  non localisés (à investiguer) : {n_notfound}")
    print("\n  NB : atteste « indexé == ce que pypdf lit dans le PDF », PAS la fidélité")
    print("       au texte officiel de loi (qui nécessiterait la source publiée).")

    if args.report is not None:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text("\n".join(report_lines), encoding="utf-8")
        print(f"\n  rapport côte-à-côte écrit → {args.report}")


if __name__ == "__main__":
    main()
