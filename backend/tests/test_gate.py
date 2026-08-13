"""Tests du gate lexical — décision, précédence, et contrainte de non-blocage.

Trois familles de tests, par ordre d'importance :

1. `test_in_domain_questions_are_never_blocked` — la contrainte dure. Refuser du
   hors-périmètre n'a de valeur que si l'on ne refuse jamais une question
   légitime. Ce test doit rester vert en toutes circonstances.

2. Les tests de PRÉCÉDENCE. L'ordre d'évaluation a été établi par l'échec : sans
   lui, « code du travail français » passe pour couvert (le vocabulaire travail
   matche) et « homicide volontaire » aussi (« peine » existe dans le Code du
   travail). Ces tests verrouillent l'ordre.

3. `test_no_term_recognized_is_not_blocking` — le point non négociable du
   dispositif. Une question dont le vocabulaire manque au lexique doit passer en
   recherche normale, pas être refusée.
"""
from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from src.rag.gate import GateDecision, GateReason, evaluate, indexed_code_years
from src.rag.lexique import get_lexique

GOLD = Path(__file__).resolve().parents[1] / "evals" / "gold_set.yaml"


@pytest.fixture(scope="module")
def gold() -> list[dict]:
    return yaml.safe_load(GOLD.read_text(encoding="utf-8"))["questions"]


@pytest.fixture(scope="module")
def in_domain(gold) -> list[dict]:
    return [q for q in gold if q.get("expected_articles")]


@pytest.fixture(scope="module")
def cross(gold) -> list[dict]:
    return [q for q in gold if not q.get("expected_articles")]


# ── contrainte dure ──────────────────────────────────────────────────────────

def test_in_domain_questions_are_never_blocked(in_domain):
    """in_domain_blocked_rate doit valoir 0.00, avec ou sans domaine déclaré."""
    blocked = [
        q["id"]
        for q in in_domain
        if evaluate(q["question"], q.get("expected_domain")).blocking
        or evaluate(q["question"]).blocking
    ]
    assert not blocked, f"questions légitimes bloquées : {blocked}"


def test_cross_domain_block_rate_meets_target(cross):
    """cross_domain_empty_rate ≥ 0.95 sur le jeu élargi (28 questions).

    Seuil et non 100 % : certaines formulations n'exposent aucun marqueur
    univoque (« qui doit réparer le dommage causé par la chute d'un mur ») et
    tombent en `no_term_recognized`. Les forcer au refus exigerait des termes
    négatifs trop généraux, qui bloqueraient des questions légitimes — le
    compromis est délibérément placé du côté de la prudence.
    """
    missed = [q["id"] for q in cross if not evaluate(q["question"]).blocking]
    rate = 1 - len(missed) / len(cross)
    assert rate >= 0.95, f"taux de refus {rate:.2f} < 0.95 ; non bloqués : {missed}"


def test_non_blocked_cross_domain_are_explicitly_annotated(cross):
    """Tout hors-périmètre non bloqué doit être un cas assumé, pas une surprise."""
    for q in cross:
        d = evaluate(q["question"])
        if d.blocking:
            continue
        expected = q.get("expected_reason") or []
        if isinstance(expected, str):
            expected = [expected]
        assert "no_term_recognized" in expected, (
            f"{q['id']} non bloqué sans annotation explicite (motif : {d.reason.value})"
        )


def test_cross_domain_reasons_match_expectation(cross):
    wrong: list[tuple[str, str, list[str]]] = []
    for q in cross:
        expected = q.get("expected_reason") or []
        if isinstance(expected, str):
            expected = [expected]
        got = evaluate(q["question"]).reason.value
        if expected and got not in expected:
            wrong.append((q["id"], got, expected))
    assert not wrong, f"motifs inattendus : {wrong}"


# ── précédence ───────────────────────────────────────────────────────────────

def test_foreign_jurisdiction_wins_over_positive_vocabulary():
    """« code du travail français » : le vocabulaire travail ne doit pas primer."""
    d = evaluate("Quelle est la durée légale du travail en France selon le code du travail français ?")
    assert d.reason is GateReason.OUT_OF_JURISDICTION
    assert d.blocking


def test_invoked_code_wins_over_covered_subject():
    """Sujet couvert (licenciement) mais texte invoqué absent (code civil)."""
    d = evaluate("Comment licencier un salarié en CDI selon le code civil gabonais ?")
    assert d.reason is GateReason.CODE_NOT_INDEXED
    assert d.invoked_code == "civil"
    assert d.blocking


def test_negative_marker_wins_over_positive_vocabulary():
    """« homicide » doit l'emporter, alors que « peine » existe en droit du travail."""
    d = evaluate("Quelle est la peine prévue pour homicide volontaire en droit pénal gabonais ?")
    assert d.reason in {GateReason.DOMAIN_NOT_INDEXED, GateReason.CODE_NOT_INDEXED}
    assert d.blocking


def test_outdated_reference_detected_on_indexed_code():
    """Le domaine est indexé : seule la date peut prouver que le texte visé ne l'est pas."""
    d = evaluate("Quel est le montant du SMIC au Gabon fixé par le code du travail de 1994 ?")
    assert d.reason is GateReason.OUTDATED_REFERENCE
    assert d.detected_year == 1994
    assert d.blocking


def test_current_year_is_not_flagged_as_outdated():
    years = indexed_code_years()
    d = evaluate(f"Que dit le code du travail de {years['travail']} sur le préavis ?")
    assert d.reason is not GateReason.OUTDATED_REFERENCE


def test_cemac_is_not_treated_as_non_indexed_regional():
    """Le Code des douanes CEMAC est indexé : douane-franchise ne doit pas casser."""
    d = evaluate("Quelles marchandises bénéficient d'une franchise de droits de douane en zone CEMAC ?")
    assert not d.blocking


# ── non-blocage ──────────────────────────────────────────────────────────────

def test_no_term_recognized_is_not_blocking():
    """Le lexique incomplet ne doit jamais produire un refus."""
    d = evaluate("Zzzz qqqq wxcvbn ?")
    assert d.reason is GateReason.NO_TERM_RECOGNIZED
    assert d.blocking is False
    assert d.indexed is True


def test_follow_up_question_without_vocabulary_is_not_blocked():
    """Question de suivi (« et en cas de faute grave ? ») : aucun terme, mais légitime."""
    assert evaluate("Et dans ce cas précis ?").blocking is False


# ── forme de la décision ─────────────────────────────────────────────────────

def test_decision_carries_audit_trail():
    d = evaluate("Comment licencier un salarié selon le code civil gabonais ?")
    assert d.matched_terms, "la décision doit porter les termes déclencheurs"
    assert d.indexed_domains, "la décision doit exposer les domaines couverts"


def test_covered_question_lists_matching_domains():
    d = evaluate("Quel est le délai de préavis en cas de licenciement ?")
    assert d.reason is GateReason.COVERED
    assert "travail" in d.matched_domaines
    assert d.indexed is True


def test_selector_domain_not_indexed_blocks_immediately():
    """Le domaine choisi dans le sélecteur est une déclaration explicite."""
    d = evaluate("Une question quelconque", "civil")
    assert d.reason is GateReason.DOMAIN_NOT_INDEXED
    assert d.blocking


def test_selector_general_does_not_block():
    """« general » est une valeur légitime du sélecteur, pas un domaine absent."""
    assert evaluate("Quel est le délai de préavis ?", "general").blocking is False


def test_decision_is_frozen():
    d = evaluate("Quel est le délai de préavis ?")
    assert isinstance(d, GateDecision)
    with pytest.raises(Exception):
        d.reason = GateReason.COVERED  # type: ignore[misc]


def test_indexed_domains_are_the_seven_codes():
    d = evaluate("Quel est le délai de préavis ?")
    assert set(d.indexed_domains) == set(get_lexique().indexed_domains())
