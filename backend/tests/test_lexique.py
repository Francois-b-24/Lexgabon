"""Tests du lexique juridique — chargement, normalisation, invariants de sûreté.

L'invariant le plus important est `test_negative_lexicon_disjoint_from_positive` :
le lexique négatif est le seul composant capable de faire REFUSER une question
légitime. Un mot du vocabulaire juridique commun qui s'y glisse (« contrat »,
« obligation ») provoque un refus sur des questions travail ou marchés publics
parfaitement couvertes. Ce test est le garde-fou contre cette régression.
"""
from __future__ import annotations

from pathlib import Path

import pytest

from src.rag.lexique import (
    get_lexique,
    load_lexique,
    normalize,
    stem_fr,
    stems,
)

LEXIQUE_PATH = Path(__file__).resolve().parents[1] / "corpus" / "lexique.yaml"


# ── normalisation ────────────────────────────────────────────────────────────

def test_normalize_strips_accents_and_case():
    assert normalize("Impôt Général") == "impot general"
    assert normalize("PRÉAVIS") == "preavis"


@pytest.mark.parametrize(
    "word,expected",
    [
        ("licenciements", "licenci"),
        ("licenciement", "licenci"),
        ("imposables", "impos"),
        ("imposable", "impos"),
        ("travailleurs", "travaill"),
    ],
)
def test_stem_fr_collapses_morphological_variants(word, expected):
    assert stem_fr(word) == expected


def test_stem_fr_keeps_short_words_intact():
    # Sous 4 caractères de racine on ne coupe pas : « eaux » ne doit pas
    # devenir « e », sinon des termes distincts fusionneraient.
    assert stem_fr("eaux") == "eaux"
    assert stem_fr("bis") == "bis"


def test_stems_of_sentence():
    assert "licenci" in stems("Quelles règles pour un licenciement ?")


# ── chargement ───────────────────────────────────────────────────────────────

def test_lexique_loads_and_has_seven_indexed_domains():
    lex = get_lexique()
    indexed = lex.indexed_domains()
    assert set(indexed) == {
        "travail", "impots", "douane", "hydrocarbures",
        "marche-public", "sante", "communication",
    }


def test_indexed_domains_carry_code_and_terms():
    lex = get_lexique()
    for dom_id in lex.indexed_domains():
        d = lex.domain(dom_id)
        assert d is not None
        assert d.code, f"{dom_id} sans code"
        assert len(d.termes) >= 50, f"{dom_id} : vocabulaire trop maigre"


def test_non_indexed_domains_present():
    lex = get_lexique()
    non_indexed = {d.id for d in lex.domaines if not d.indexed}
    assert {"civil", "penal", "famille", "fonction_publique"} <= non_indexed


def test_codes_declare_indexed_flag():
    lex = get_lexique()
    by_id = {c.id: c for c in lex.codes}
    assert by_id["travail"].indexed is True
    assert by_id["civil"].indexed is False


def test_cemac_is_not_listed_as_non_indexed_regional():
    """Le Code des douanes CEMAC EST indexé — le lister casserait douane-franchise."""
    lex = get_lexique()
    assert not any("cemac" in r for r in lex.regionaux_non_indexes)


def test_ohada_is_listed_as_non_indexed_regional():
    lex = get_lexique()
    assert any("ohada" in r for r in lex.regionaux_non_indexes)


# ── invariants de sûreté ─────────────────────────────────────────────────────

def test_negative_lexicon_disjoint_from_positive():
    """Aucun terme négatif ne doit appartenir au vocabulaire d'un domaine indexé.

    Sans cet invariant, un mot commun placé dans le lexique négatif ferait
    refuser des questions légitimes — le pire échec possible pour ce produit.
    """
    lex = get_lexique()
    positive: set[str] = set()
    for d in lex.domaines:
        if d.indexed:
            positive |= set(d.stems)

    collisions: list[tuple[str, str]] = []
    for d in lex.domaines:
        if d.indexed:
            continue
        for term in d.termes:
            if " " in term or "'" in term:
                continue  # les expressions sont testées par sous-chaîne, pas de collision
            if stem_fr(term) in positive:
                collisions.append((d.id, term))

    assert not collisions, f"termes négatifs présents aussi en positif : {collisions}"


def test_generic_legal_words_absent_from_negative_lexicon():
    """« contrat » et « obligation » sont du vocabulaire commun, jamais des marqueurs."""
    lex = get_lexique()
    banned = {"contrat", "obligation", "article", "loi", "droit", "condition"}
    for d in lex.domaines:
        if d.indexed:
            continue
        simple = {t for t in d.termes if " " not in t and "'" not in t}
        assert not (simple & banned), f"{d.id} contient un terme trop générique"


def test_load_lexique_accepts_explicit_path():
    lex = load_lexique(LEXIQUE_PATH)
    assert lex.domaines
