"""Tests du filtrage des sources affichées à l'utilisateur."""
from __future__ import annotations

from src.agent.chat_engine import _cited_article_numbers, _filter_sources_to_cited


def _src(num: str | None) -> dict:
    return {
        "citation": f"Code X — Article {num}",
        "text": "…",
        "score": 0.5,
        "badge": "doc",
        "id": f"id-{num}",
        "metadata": {"numero_article": num} if num is not None else {},
    }


def test_cited_article_numbers_extracts_basic_citations():
    text = (
        "Le préavis d'un cadre est de trois mois [Article 82, Code du travail]. "
        "Voir aussi [Article 70 bis, Code du travail]."
    )
    cited = _cited_article_numbers(text)
    assert cited == {"82", "70bis"}


def test_cited_article_numbers_handles_no_citation():
    text = "Une réponse de fond sans aucune citation."
    assert _cited_article_numbers(text) == set()


def test_filter_drops_everything_when_no_citation():
    sources = [_src("12"), _src("82"), _src("100")]
    kept = _filter_sources_to_cited(sources, set())
    assert kept == []


def test_filter_keeps_only_cited_sources():
    sources = [_src("12"), _src("82"), _src("100"), _src("70bis")]
    kept = _filter_sources_to_cited(sources, {"82", "70bis"})
    assert len(kept) == 2
    nums = {s["metadata"]["numero_article"] for s in kept}
    assert nums == {"82", "70bis"}


def test_filter_ignores_sources_without_article_number():
    sources = [_src("82"), _src(None)]
    kept = _filter_sources_to_cited(sources, {"82"})
    assert len(kept) == 1
    assert kept[0]["metadata"]["numero_article"] == "82"
