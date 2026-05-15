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


def extract_pdf_pages(data: bytes) -> list[str]:
    """Texte brut par page (pypdf)."""
    reader = PdfReader(BytesIO(data))
    pages: list[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return pages


def reconstruct_full_text(pages: list[str]) -> str:
    """Concatène les pages avec un séparateur \\n\\n puis normalise (césure, espaces, NBSP)."""
    joined = "\n\n".join(p for p in pages if p)
    return normalize_pdf_text(joined)


def parse_pdf_articles(data: bytes) -> list[ArticleSegment]:
    """PDF bytes → liste d'articles structurés (numero, text, titre_section)."""
    pages = extract_pdf_pages(data)
    full = reconstruct_full_text(pages)
    return split_articles(full)


def chunks_from_pdf(
    data: bytes,
    *,
    base_meta: dict[str, str] | None = None,
    max_chars: int = 1500,
) -> list[Chunk]:
    """Pipeline complet : PDF bytes → chunks Chroma-ready (article-aware ou fallback)."""
    pages = extract_pdf_pages(data)
    full = reconstruct_full_text(pages)
    return build_chunks_from_text(full, base_meta=base_meta, max_chars=max_chars)
