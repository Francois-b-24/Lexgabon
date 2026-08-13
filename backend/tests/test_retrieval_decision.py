"""Propagation de la décision du gate jusqu'au modèle de réponse API.

Le refus doit être un champ typé, lisible par le client sans inspecter le texte
de la réponse. Ces tests verrouillent le contrat entre `GateDecision` (interne)
et `RetrievalDecision` (exposé), ainsi que la rétro-compatibilité du schéma.
"""
from __future__ import annotations

from src.agent.schemas import ChatResponse, Quality, RetrievalDecision
from src.rag.gate import GateReason, evaluate
from src.routes.chat import _retrieval_decision


def _decision(question: str, n_sources: int = 0) -> RetrievalDecision:
    d = _retrieval_decision(evaluate(question), n_sources)
    assert d is not None
    return d


def test_none_decision_yields_none():
    """Un appel sans gate ne doit pas fabriquer de décision factice."""
    assert _retrieval_decision(None, 0) is None


def test_refusal_is_exposed_as_typed_field():
    d = _decision("Comment licencier un salarié en CDI selon le code civil gabonais ?")
    assert d.reason == "code_not_indexed"
    assert d.indexed is False
    assert d.invoked_code == "civil"
    assert d.invoked_code_label == "Code civil"


def test_covered_question_is_marked_indexed():
    d = _decision("Quel est le délai de préavis en cas de licenciement ?", n_sources=5)
    assert d.reason == "covered"
    assert d.indexed is True
    assert "travail" in d.matched_domaines
    assert d.n_passages == 5


def test_outdated_reference_carries_year():
    d = _decision("Quel est le montant du SMIC fixé par le code du travail de 1994 ?")
    assert d.reason == "outdated_reference"
    assert d.detected_year == 1994
    assert d.indexed is False


def test_decision_exposes_covered_domains_for_the_client():
    """Le client affiche les matières couvertes sans les coder en dur."""
    d = _decision("Quelles sont les causes de divorce au Gabon ?")
    assert d.indexed is False
    assert set(d.indexed_domains) == {
        "travail", "impots", "douane", "hydrocarbures",
        "marche-public", "sante", "communication",
    }


def test_matched_terms_are_deduplicated_by_stem():
    """La trace d'audit reste lisible : une forme par racine, pas les variantes."""
    d = _decision("Quel est le délai de préavis en cas de licenciement ?")
    assert d.matched_terms
    assert len([t for t in d.matched_terms if t.startswith("licenci")]) == 1


def test_no_term_recognized_stays_indexed():
    """Un lexique incomplet ne doit pas se traduire par un refus côté client."""
    d = _decision("Zzzz qqqq wxcvbn ?")
    assert d.reason == "no_term_recognized"
    assert d.indexed is True


def test_chat_response_retrieval_is_optional():
    """Les clients antérieurs au gate continuent de fonctionner."""
    r = ChatResponse(answer="x", sources=[], quality=Quality(), session_id="s")
    assert r.retrieval is None
    assert "retrieval" in r.model_dump()


def test_chat_response_serialises_decision():
    r = ChatResponse(
        answer="x",
        sources=[],
        quality=Quality(),
        session_id="s",
        retrieval=_decision("Quelles sont les causes de divorce au Gabon ?"),
    )
    payload = r.model_dump()
    assert payload["retrieval"]["indexed"] is False
    assert payload["retrieval"]["reason"] == "domain_not_indexed"


def test_every_gate_reason_is_accepted_by_the_schema():
    """Le schéma API doit couvrir tous les motifs que le gate peut produire."""
    for reason in GateReason:
        RetrievalDecision(reason=reason.value, indexed=reason is GateReason.COVERED)
