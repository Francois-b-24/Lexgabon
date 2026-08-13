"""Tests de régression du chunker article-aware (src/rag/chunking.py).

Référentiels documentés dans CLAUDE.md — ne pas régresser sans recompter
sur corpus/pdfs/code-travail-2021.pdf.
"""
from __future__ import annotations

import pytest

from src.rag.chunking import (
    build_chunks_from_text,
    chunk_long_article,
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


def test_one_per_article_keeps_long_articles_intact():
    """T2.1 : one_per_article=True produit 1 Chunk par article, même très long."""
    long_body = "Disposition. " * 300  # ~3600 chars, dépasse largement max_chars=1500
    text = f"Article 1: {long_body}\n\nArticle 2: Texte court."
    chunks = build_chunks_from_text(text, one_per_article=True, max_chars=1500)
    # Sans one_per_article, l'article 1 aurait été subdivisé en plusieurs chunks.
    assert len(chunks) == 2
    nums = [c.numero_article for c in chunks]
    assert nums == ["1", "2"]
    # Le texte complet est conservé dans le chunk (même si > 1500 chars).
    assert len(chunks[0].text) > 1500


def test_default_mode_still_splits_long_articles():
    """Vérifie qu'on n'a pas régressé sur le comportement par défaut (T1.1)."""
    long_body = "Disposition. " * 300
    text = f"Article 1: {long_body}\n\nArticle 2: Court."
    chunks = build_chunks_from_text(text, max_chars=1500)
    # Article 1 doit être subdivisé, donc len > 2.
    assert len(chunks) > 2
    nums = {c.numero_article for c in chunks}
    assert nums == {"1", "2"}


def test_book_prefixed_article_is_detected():
    """« Art.P‐816.‐ » : format du Livre 5 « Procédures fiscales » du CGI.

    Sans cette forme, les 336 articles du livre restaient soudés dans un unique
    chunk de 185 666 caractères — invisible pour l'embedding, dont le vecteur
    devient une moyenne diluée sur tout un livre. C'est ce qui rendait la
    question sur la prescription fiscale impossible à satisfaire.
    """
    text = (
        "Art.P‐816.‐ Les dispositions du présent Livre régissent les procédures. "
        "Art.P‐817.‐ Le contribuable est tenu de souscrire une déclaration."
    )
    segs = split_articles(text)
    nums = [s.numero for s in segs]
    assert nums == ["p-816", "p-817"], nums


def test_book_prefix_kept_to_avoid_collision():
    """Le préfixe fait partie du numéro : P-816 ≠ 816 d'un autre livre."""
    segs = split_articles("Art.P-816.- Procédures. Article 816 : autre livre.")
    nums = [s.numero for s in segs]
    assert "p-816" in nums and "816" in nums, nums


def test_plain_articles_still_detected_after_prefix_support():
    """Non-régression : les formes usuelles restent reconnues."""
    segs = split_articles("Article 12 : Premier. Art. 13 — Second.")
    assert [s.numero for s in segs] == ["12", "13"]


def test_long_article_chunks_start_on_word_boundary():
    """Le recouvrement ne doit pas couper un mot en deux.

    L'overlap repartait `overlap` caractères en arrière sans égard aux mots :
    « …autorise le contracteur » devenait « orise le contracteur… ». Un chunk
    commençant par un fragment illisible dégrade son propre embedding.
    """
    body = " ".join(f"definition numero {i} du terme technique concerne" for i in range(120))
    parts = chunk_long_article(body, "9", max_chars=400)
    assert len(parts) > 2
    for p in parts[1:]:
        payload = p.split("— ", 1)[-1]
        first = payload.split(" ", 1)[0]
        assert first in body.split(), f"chunk commence par un fragment : {first!r}"


def test_long_article_keeps_article_number_on_every_part():
    """Chaque morceau reste citable : le numéro d'article est conservé partout."""
    body = "x. " * 900
    parts = chunk_long_article(body, "42", max_chars=500)
    assert len(parts) > 1
    assert parts[0].startswith("Article 42 — ")
    assert all(p.startswith("Article 42 (suite) — ") for p in parts[1:])
