"""Tests de la composition du prompt système par profil utilisateur."""
from __future__ import annotations

from src.agent.prompts import (
    SYSTEM_PROMPT_FAST,
    SYSTEM_PROMPT_NON_JURISTE,
    build_system_prompt,
)


def test_no_profile_returns_default_prompt():
    assert build_system_prompt(None) == SYSTEM_PROMPT_FAST


def test_unknown_profile_falls_back_to_default():
    assert build_system_prompt("autre") == SYSTEM_PROMPT_FAST
    assert build_system_prompt("") == SYSTEM_PROMPT_FAST


def test_professionnel_profile_prefixes_pro_block():
    p = build_system_prompt("professionnel")
    assert p.startswith("ADAPTATION AU PROFIL — Professionnel du droit")
    assert SYSTEM_PROMPT_FAST in p


def test_etudiant_profile_prefixes_student_block():
    p = build_system_prompt("etudiant")
    assert p.startswith("ADAPTATION AU PROFIL — Étudiant en droit")
    assert SYSTEM_PROMPT_FAST in p


def test_non_juriste_profile_returns_dedicated_prompt():
    """Le profil non_juriste remplace intégralement le prompt par défaut."""
    p = build_system_prompt("non_juriste")
    assert p == SYSTEM_PROMPT_NON_JURISTE
    # Le disclaimer non-juriste est imposé, pas la phrase juriste.
    assert "ne constitue pas un conseil juridique" in p
    assert "professionnel du droit" in p


def test_profile_block_does_not_override_hard_rules():
    """Les règles dures (périmètre, citations, disclaimer) restent présentes
    pour les profils qui s'appuient sur SYSTEM_PROMPT_FAST."""
    for profile in ("professionnel", "etudiant", None):
        p = build_system_prompt(profile)
        assert "PÉRIMÈTRE STRICT" in p
        assert "[Article N" in p  # règle citation
        assert "ne constitue pas un conseil juridique" in p  # nouveau disclaimer
        assert "INTERDIT" in p  # règle anti-markdown
