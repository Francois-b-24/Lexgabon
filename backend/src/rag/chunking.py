"""Découpage texte et extraction PDF partagés (uploads session + corpus RAG)."""
from __future__ import annotations

import re
from io import BytesIO

from pypdf import PdfReader


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> list[str]:
    t = re.sub(r"\s+", " ", text).strip()
    if not t:
        return []
    chunks: list[str] = []
    i = 0
    while i < len(t):
        end = min(len(t), i + chunk_size)
        chunks.append(t[i:end].strip())
        if end >= len(t):
            break
        i = max(0, end - overlap)
    return [c for c in chunks if c]


def extract_pdf_text(data: bytes) -> str:
    reader = PdfReader(BytesIO(data))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts).strip()
