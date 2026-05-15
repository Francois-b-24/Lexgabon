"""Tests de régression du chunker article-aware (src/rag/chunking.py).

Référentiels documentés dans CLAUDE.md — ne pas régresser sans recompter
sur corpus/pdfs/code-travail-2021.pdf.
"""
from __future__ import annotations

import pytest

from src.rag.chunking import (
    build_chunks_from_text,
    split_articles,
)


def test_two_consecutive_articles():
    text = "Article 1: Foo. Article 2 — Bar."
    segs = split_articles(text)
    assert len(segs) == 2
    assert {s.numero for s in segs} == {"1", "2"}


def test_internal_reference_after_period_is_ignored():
    """« Dans l'article 54 ci-dessus » ne doit PAS être détecté comme un nouvel en-tête."""
    text = "Article 54: La suspension. Dans l'article 54 ci-dessus, voir."
    segs = split_articles(text)
    assert len(segs) == 1
    assert segs[0].numero == "54"


def test_cet_article_prefix_filters_reference():
    text = "Cet article 12 vise les cadres. Article 13: Le travailleur."
    segs = split_articles(text)
    assert len(segs) == 1
    assert segs[0].numero == "13"


def test_aux_articles_plural_reference_ignored():
    text = "aux articles 12 et 13 du code, voir aussi."
    segs = split_articles(text)
    assert segs == []


def test_selon_l_article_then_new_article():
    text = "Selon l'article 5 du présent acte, Article 6: Texte."
    segs = split_articles(text)
    assert len(segs) == 1
    assert segs[0].numero == "6"


def test_article_1er_is_normalized_to_1():
    text = "Article 1er: La loi régit. Article 2: Sont concernés."
    segs = split_articles(text)
    assert len(segs) == 2
    assert segs[0].numero == "1"
    assert segs[1].numero == "2"


def test_article_12_bis_keeps_suffix():
    text = "Article 12 bis: Cas particulier. Article 13: Suite."
    segs = split_articles(text)
    assert len(segs) == 2
    assert segs[0].numero == "12 bis"
    assert segs[1].numero == "13"


def test_article_glued_to_previous_word_in_flattened_pdf():
    """Cas typique pypdf : « communesArticle 19: » sans espace ni saut."""
    text = "Section 1 : Des dispositions communesArticle 19: Le contrat individuel."
    segs = split_articles(text)
    assert len(segs) == 1
    assert segs[0].numero == "19"


def test_build_chunks_propagates_metadata():
    text = (
        "TITRE I — DISPOSITIONS GENERALES\n\n"
        "Article 1: Première règle.\n\n"
        "Article 2: Seconde règle."
    )
    chunks = build_chunks_from_text(text, base_meta={"source_key": "abc"})
    assert len(chunks) == 2
    assert chunks[0].numero_article == "1"
    assert chunks[1].numero_article == "2"
    # Le préfixe « Article N — » est conservé dans le texte du chunk
    assert chunks[0].text.startswith("Article 1 —") or chunks[0].text.startswith("Article 1 -") or "Article 1" in chunks[0].text


def test_no_article_returns_empty_segments():
    text = "Préambule sans article numéroté. Considérations générales."
    segs = split_articles(text)
    assert segs == []
