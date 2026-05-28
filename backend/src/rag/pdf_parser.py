"""Extraction PDF + parsing d'articles pour textes juridiques."""
from __future__ import annotations

from io import BytesIO

from pypdf import PdfReader

from src.rag.chunking import (
    ArticleSegment,
    Chunk,
    build_chunks_from_text,
    normalize_pdf_text,
    split_articles,
)


def extract_pdf_pages(data: bytes, *, extraction_mode: str = "plain") -> list[str]:
    """Texte brut par page (pypdf).

    `extraction_mode` :
      - "plain"  (défaut) : extraction standard, adaptée aux PDF multi-colonnes.
      - "layout" : préserve la disposition spatiale. Indispensable pour les PDF
        dont le texte est justifié par espacement caractère (« L a  C S S »
        au lieu de « La CSS ») — typiquement le Code général des impôts. En mode
        layout les vraies frontières de mots ressortent en espaces multiples,
        recollés ensuite par normalize_pdf_text. À RÉSERVER aux PDF concernés :
        layout mélange les colonnes sur les mises en page sur deux colonnes.
    """
    reader = PdfReader(BytesIO(data))
    pages: list[str] = []
    for page in reader.pages:
        if extraction_mode == "layout":
            try:
                pages.append(page.extract_text(extraction_mode="layout") or "")
                continue
            except Exception:
                pass  # repli sur l'extraction standard si layout échoue
        pages.append(page.extract_text() or "")
    return pages


def reconstruct_full_text(pages: list[str]) -> str:
    """Concatène les pages avec un séparateur \\n\\n puis normalise (césure, espaces, NBSP)."""
    joined = "\n\n".join(p for p in pages if p)
    return normalize_pdf_text(joined)


def parse_pdf_articles(data: bytes, *, extraction_mode: str = "plain") -> list[ArticleSegment]:
    """PDF bytes → liste d'articles structurés (numero, text, titre_section)."""
    pages = extract_pdf_pages(data, extraction_mode=extraction_mode)
    full = reconstruct_full_text(pages)
    return split_articles(full)


def chunks_from_pdf(
    data: bytes,
    *,
    base_meta: dict[str, str] | None = None,
    max_chars: int = 1500,
    one_per_article: bool = False,
    extraction_mode: str = "plain",
) -> list[Chunk]:
    """Pipeline complet : PDF bytes → chunks Chroma-ready (article-aware ou fallback).

    Si `one_per_article=True` (T2.1), un Chunk = un article complet, même long.
    `extraction_mode` est transmis à extract_pdf_pages (voir sa docstring).
    """
    pages = extract_pdf_pages(data, extraction_mode=extraction_mode)
    full = reconstruct_full_text(pages)
    return build_chunks_from_text(
        full, base_meta=base_meta, max_chars=max_chars, one_per_article=one_per_article
    )
