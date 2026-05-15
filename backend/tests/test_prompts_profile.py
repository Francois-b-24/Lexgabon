"""Tests de la composition du prompt système par profil utilisateur."""
from __future__ import annotations

from src.agent.prompts import SYSTEM_PROMPT_FAST, build_system_prompt


def test_no_profile_returns_default_prompt():
    assert build_system_prompt(None) == SYSTEM_PROMPT_FAST


def test_unknown_profile_falls_back_to_default():
    assert build_system_prompt("autre") == SYSTEM_PROMPT_FAST
    assert build_system_prompt("") == SYSTEM_PROMPT_FAST


def test_avocat_profile_prefixes_lawyer_block():
    p = build_system_prompt("avocat")
    assert p.startswith("ADAPTATION AU PROFIL — Avocat")
    assert SYSTEM_PROMPT_FAST in p


def test_juriste_profile_prefixes_inhouse_block():
    p = build_system_prompt("juriste")
    assert p.startswith("ADAPTATION AU PROFIL — Juriste d'entreprise")
    assert SYSTEM_PROMPT_FAST in p


def test_etudiant_profile_prefixes_student_block():
    p = build_system_prompt("etudiant")
    assert p.startswith("ADAPTATION AU PROFIL — Étudiant en droit")
    assert SYSTEM_PROMPT_FAST in p


def test_profile_block_does_not_override_hard_rules():
    """Les règles dures du SYSTEM_PROMPT_FAST (périmètre, citations, disclaimer)
    sont toujours présentes quelle que soit la variante de profil."""
    for profile in ("avocat", "juriste", "etudiant", None):
        p = build_system_prompt(profile)
        assert "PÉRIMÈTRE STRICT" in p
        assert "[Article N" in p  # règle citation
        assert "Il s'agit d'une information juridique générale" in p  # disclaimer
        assert "INTERDIT" in p  # règle anti-markdown
