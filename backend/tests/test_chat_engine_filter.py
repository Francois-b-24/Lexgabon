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


# ── Nouvelles variantes de citation (étape 2) ─────────────────────────────────

def test_cited_art_abbreviated_form():
    """Art. 12 entre crochets doit être capturé."""
    text = "Voir [Art. 12, Code du travail]."
    assert "12" in _cited_article_numbers(text)


def test_cited_article_guillemets_francais():
    """« article 12 » entre guillemets français doit être capturé."""
    text = "Conformément à « article 12 » du code."
    assert "12" in _cited_article_numbers(text)


def test_cited_article_inline_du_code():
    """Mention inline sans crochet : 'article 12 du Code' doit être capturée."""
    text = "L'article 54 du Code du travail prévoit un préavis."
    assert "54" in _cited_article_numbers(text)


def test_cited_article_composé_tiret():
    """Numéro composé 12-1 doit être capturé et normalisé."""
    cited = _cited_article_numbers("[Article 12-1, Code des impôts]")
    assert "12-1" in cited


def test_cited_article_ordinal_1er():
    """Article 1er doit être normalisé en '1' (sans suffixe ordinal)."""
    cited = _cited_article_numbers("[Article 1er, Code du travail]")
    assert "1" in cited


def test_cited_article_quater():
    """Variante quater doit être capturée."""
    cited = _cited_article_numbers("[Article 8 quater, CGI]")
    assert "8quater" in cited


def test_cited_multiple_variants_in_one_text():
    """Un texte mélangeant plusieurs formes retourne tous les numéros."""
    text = (
        "[Article 82, Code du travail]. "
        "Voir Art. 54 bis pour le préavis. "
        "L'article 12 du Code civil s'applique aussi. "
        "Consulter « article 1er » en cas de doute."
    )
    cited = _cited_article_numbers(text)
    assert "82" in cited
    assert "54bis" in cited
    assert "12" in cited
    assert "1" in cited
