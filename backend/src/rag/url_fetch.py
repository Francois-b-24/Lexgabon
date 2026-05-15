"""Fetch HTTP contrôlé (allowlist) + extraction texte HTML ou PDF."""
from __future__ import annotations

import logging

import httpx
import trafilatura

from src.config import get_settings
from src.rag.chunking import extract_pdf_text
from src.url_allowlist import is_url_host_allowed

logger = logging.getLogger(__name__)

DEFAULT_UA = "LexGabonIngest/1.0 (+https://github.com/Francois-b-24/Lexgabon)"


def validate_https_public_url(url: str) -> str:
    u = (url or "").strip()
    if not u.lower().startswith("https://"):
        raise ValueError("URL doit commencer par https://")
    if not is_url_host_allowed(u):
        raise ValueError("Domaine non autorisé pour l'indexation (hors liste officielle).")
    return u


def fetch_text_from_url(url: str) -> tuple[str, str]:
    """Retourne (texte extrait, titre indicatif)."""
    s = get_settings()
    u = validate_https_public_url(url)
    limits = httpx.Limits(max_keepalive_connections=3, max_connections=3)
    with httpx.Client(
        headers={"User-Agent": DEFAULT_UA},
        timeout=s.ingest_url_timeout_seconds,
        follow_redirects=True,
        limits=limits,
    ) as client:
        r = client.get(u)
        r.raise_for_status()
        body = r.content
        if len(body) > s.ingest_url_max_bytes:
            raise ValueError(f"Réponse trop volumineuse (max {s.ingest_url_max_bytes} octets)")
        ctype = (r.headers.get("content-type") or "").split(";")[0].strip().lower()
        enc = r.encoding or "utf-8"

    slug = u.rsplit("/", 1)[-1].split("?", 1)[0] or "document"
    title = slug.replace("-", " ")[:200] or u

    if "pdf" in ctype or u.lower().endswith(".pdf"):
        text_full = extract_pdf_text(body)
        if slug.lower().endswith(".pdf"):
            title = slug[:200]
    else:
        try:
            html = body.decode(enc, errors="replace")
        except Exception:
            html = body.decode("utf-8", errors="replace")
        try:
            text_full = trafilatura.extract(html, url=u) or ""
        except Exception as e:
            logger.warning("trafilatura: %s", e)
            raise ValueError("Impossible d'extraire le texte de cette page.") from e

    text_full = (text_full or "").strip()
    if not text_full:
        raise ValueError("Aucun texte exploitable extrait de l'URL.")
    return text_full, title
