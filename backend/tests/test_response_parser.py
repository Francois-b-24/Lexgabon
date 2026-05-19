"""Tests du parser de note juridique (parse_legal_note)."""
from __future__ import annotations

import pytest

from src.agent.response_parser import parse_legal_note
from src.agent.schemas import SourceItem


DISCLAIMER = "Cette réponse ne constitue pas un conseil juridique, veuillez si nécessaire consulter un professionnel du droit."


@pytest.fixture
def src_code_travail_art_82() -> SourceItem:
    return SourceItem(
        citation="Code du travail — Article 82 (Loi n° 022/2021 du 19 novembre 2021)",
        text="La durée du préavis est déterminée en fonction du temps de présence...",
        score=0.78,
        numero_article="82",
        slug="code-travail-2021",
        url=None,
    )


@pytest.fixture
def src_ohada_art_5() -> SourceItem:
    return SourceItem(
        citation="Acte uniforme OHADA — Article 5",
        text="Toute société commerciale a la personnalité juridique...",
        score=0.66,
        numero_article="5",
        slug="ohada-acte-uniforme",
        url="https://ohada.org/...",
    )


def test_parse_simple_paragraphs_with_disclaimer(src_code_travail_art_82):
    raw = (
        "Le préavis dépend de l'ancienneté du salarié [Article 82, Code du travail].\n\n"
        "Il commence à courir à la date de notification du licenciement.\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [src_code_travail_art_82])

    assert result.disclaimer == DISCLAIMER
    assert len(result.paragraphs) == 2
    # Premier paragraphe : citation extraite, texte nettoyé
    p1 = result.paragraphs[0]
    assert "[Article 82" not in p1.text
    assert "le préavis dépend de l'ancienneté du salarié" in p1.text.lower()
    assert len(p1.refs) == 1
    assert p1.refs[0].kind == "article"
    assert p1.refs[0].article == "82"
    assert p1.refs[0].code == "Code du travail"
    assert p1.refs[0].source_index == 0
    assert p1.refs[0].slug == "code-travail-2021"
    # Second paragraphe : pas de citation
    p2 = result.paragraphs[1]
    assert p2.refs == []
    assert "à la date de notification" in p2.text


def test_parse_multiple_citations_same_paragraph(src_code_travail_art_82, src_ohada_art_5):
    raw = (
        "Le préavis [Article 82, Code du travail] s'articule avec l'engagement social "
        "[Article 5, Acte uniforme OHADA].\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [src_code_travail_art_82, src_ohada_art_5])
    assert len(result.paragraphs) == 1
    refs = result.paragraphs[0].refs
    assert len(refs) == 2
    articles = {r.article for r in refs}
    assert articles == {"82", "5"}


def test_parse_source_citation_only():
    src = SourceItem(
        citation="Journal officiel n°139 du 23 novembre 2021",
        text="...",
        score=0.5,
        slug=None,
    )
    raw = (
        "La publication au Journal officiel est la condition d'opposabilité [Source : Journal officiel n°139 du 23 novembre 2021].\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [src])
    assert len(result.paragraphs) == 1
    assert len(result.paragraphs[0].refs) == 1
    ref = result.paragraphs[0].refs[0]
    assert ref.kind == "source"
    assert "Journal officiel" in ref.label
    assert ref.source_index == 0


def test_parse_orphan_citation_no_matching_source():
    """Citation d'un article absent de `sources` : conservée dans refs avec source_index=None."""
    raw = (
        "L'employeur respecte le délai légal [Article 999, Code inexistant].\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [])
    assert len(result.paragraphs) == 1
    refs = result.paragraphs[0].refs
    assert len(refs) == 1
    assert refs[0].article == "999"
    assert refs[0].source_index is None
    assert refs[0].slug is None


def test_parse_off_topic_refusal():
    """Réponse de refus hors périmètre : pas de citation mais le disclaimer reste."""
    raw = (
        "Cette question dépasse le périmètre du droit gabonais. Je peux uniquement vous aider sur les textes applicables au Gabon.\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [])
    assert result.disclaimer == DISCLAIMER
    assert len(result.paragraphs) == 1
    assert result.paragraphs[0].refs == []
    assert "dépasse le périmètre" in result.paragraphs[0].text


def test_parse_empty_input_returns_empty_answer():
    result = parse_legal_note("", [])
    assert result.paragraphs == []
    assert result.disclaimer is None


def test_parse_single_line_no_double_newline(src_code_travail_art_82):
    """Le LLM n'a pas paragraphé : on garde au moins un paragraphe."""
    raw = f"Le préavis dépend de l'ancienneté [Article 82, Code du travail]. {DISCLAIMER}"
    result = parse_legal_note(raw, [src_code_travail_art_82])
    # Le disclaineur sur la même ligne ne sera pas isolé (pas de \n) : on accepte ce comportement
    # tant qu'on a au moins un paragraphe parlant de l'article.
    assert len(result.paragraphs) >= 1
    all_refs = [r for p in result.paragraphs for r in p.refs]
    assert any(r.article == "82" for r in all_refs)


def test_parse_article_with_bis_suffix():
    src = SourceItem(
        citation="Code du travail — Article 12 bis",
        text="...",
        score=0.7,
        numero_article="12 bis",
    )
    raw = f"Selon [Article 12 bis, Code du travail], le cadre concerné.\n\n{DISCLAIMER}"
    result = parse_legal_note(raw, [src])
    assert len(result.paragraphs) == 1
    refs = result.paragraphs[0].refs
    assert len(refs) == 1
    # On accepte « 12 bis » ou « 12bis » selon la normalisation
    assert refs[0].article.lower().replace(" ", "") == "12bis"


def test_parse_deduplicates_repeated_citation(src_code_travail_art_82):
    """Si le LLM répète [Article 82, Code du travail] dans le même paragraphe, on garde une seule ref."""
    raw = (
        "Le préavis [Article 82, Code du travail] dépend du temps de présence ; "
        "[Article 82, Code du travail] précise les modalités.\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [src_code_travail_art_82])
    assert len(result.paragraphs) == 1
    refs = result.paragraphs[0].refs
    assert len(refs) == 1
    assert refs[0].article == "82"


def test_parse_text_cleanup_removes_orphan_punctuation():
    """Quand la citation est suivie d'une virgule + point, on ne laisse pas « , . » résiduels."""
    src = SourceItem(citation="Code du travail — Article 82", numero_article="82", text="...", score=0.7)
    raw = (
        "La règle s'applique [Article 82, Code du travail], sous réserve d'exceptions.\n\n"
        f"{DISCLAIMER}"
    )
    result = parse_legal_note(raw, [src])
    p = result.paragraphs[0].text
    assert "  " not in p
    assert " ,," not in p
    assert " ," not in p[:len(p)-1]  # pas d'espace avant virgule


def test_parse_sources_accepts_dict_input():
    """Si on passe `sources` en list[dict] (cas runtime), le parser tolère."""
    raw = f"Voir [Article 5, Code OHADA].\n\n{DISCLAIMER}"
    result = parse_legal_note(raw, [{"citation": "Code OHADA — Article 5", "numero_article": "5", "text": "x", "score": 0.5, "slug": "ohada"}])
    assert len(result.paragraphs) == 1
    assert result.paragraphs[0].refs[0].article == "5"
    assert result.paragraphs[0].refs[0].slug == "ohada"
