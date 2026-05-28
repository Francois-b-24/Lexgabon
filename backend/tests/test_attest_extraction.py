"""Garde-fou de l'outil d'attestation (scripts/attest_extraction.py).

L'aligneur doit : (a) reconnaître un texte présent dans le PDF malgré des espaces
parasites différents (sim ≈ 1), (b) signaler un texte réellement absent (sim ≈ 0).
Si ces deux propriétés cassent, l'attestation devient trompeuse.
"""
from __future__ import annotations

from scripts.attest_extraction import best_pdf_alignment


_PDF = (
    "Article 1 : Le présent code régit les relations de travail. "
    "Article 2 : La duréede travail est fixée à quarante heures par semaine."
)


def test_aligner_matches_present_text_despite_spacing():
    indexed = "La durée de travail est fixée à quarante heures par semaine."
    sim, _ = best_pdf_alignment(_PDF, indexed, 400)
    assert sim > 0.95


def test_aligner_flags_absent_text():
    indexed = "Texte totalement absent parlant de fiscalité pétrolière offshore."
    sim, _ = best_pdf_alignment(_PDF, indexed, 400)
    assert sim < 0.5
