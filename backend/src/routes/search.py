"""Route `/api/search-semantic` — recherche sémantique sur Chroma sans LLM.

Utilisé par la page `/recherche` (mode `semantic`) côté Next pour proposer une
recherche par sens en complément de la recherche full-text Meilisearch.
Pas d'appel Anthropic ici : on retourne directement les top-k articles avec
leurs métadonnées Chroma.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.rag import retriever
from src.rate_limit import check_rate_limit_chat

logger = logging.getLogger(__name__)

router = APIRouter()


class SemanticSearchRequest(BaseModel):
    q: str = Field(..., min_length=1, max_length=512)
    sources: list[str] = Field(default_factory=list)  # slugs d'URL : jo-ga, ohada, ...
    types: list[str] = Field(default_factory=list)
    domaines: list[str] = Field(default_factory=list)
    date_from: str | None = None
    date_to: str | None = None
    limit: int = Field(default=20, ge=1, le=50)
    offset: int = Field(default=0, ge=0, le=500)


class SemanticSearchHit(BaseModel):
    slug: str | None = None
    source: str | None = None
    sourceLabel: str | None = None
    titre: str
    resume: str | None = None
    type: str | None = None
    reference: str | None = None
    datePublication: str | None = None
    estEnVigueur: bool = True
    articleNumero: str | None = None
    score: float


class SemanticSearchResponse(BaseModel):
    hits: list[SemanticSearchHit]
    total: int


# Mapping des slugs d'URL côté Next vers les libellés probables côté métadonnées Chroma.
# On match libéral : on accepte que l'autorité contient le mot-clé.
_URL_SLUG_KEYWORDS: dict[str, tuple[str, ...]] = {
    "jo-ga": ("gabon", "republique gabonaise", "jo gabon"),
    "ohada": ("ohada",),
    "cemac": ("cemac",),
    "cobac": ("cobac",),
    "cima": ("cima",),
}


def _matches_source_filter(meta: dict[str, Any], allowed_slugs: list[str]) -> bool:
    if not allowed_slugs:
        return True
    autorite = str(meta.get("autorite") or "").lower()
    code = str(meta.get("code") or "").lower()
    haystack = f"{autorite} {code}"
    for slug in allowed_slugs:
        for kw in _URL_SLUG_KEYWORDS.get(slug, ()):
            if kw in haystack:
                return True
    return False


def _matches_date_range(meta: dict[str, Any], date_from: str | None, date_to: str | None) -> bool:
    if not date_from and not date_to:
        return True
    raw_date = str(meta.get("date") or "").strip()
    if not raw_date:
        return True  # date inconnue → on ne filtre pas, on garde le doc
    # On accepte les formats "YYYY-MM-DD" et "YYYY"
    candidate = raw_date if len(raw_date) >= 10 else f"{raw_date[:4]}-01-01"
    if date_from and candidate < date_from:
        return False
    if date_to and candidate > date_to:
        return False
    return True


@router.post("/api/search-semantic")
async def api_search_semantic(request: Request, body: SemanticSearchRequest):
    ip = (request.headers.get("x-forwarded-for") or "local").split(",")[0].strip() or "local"
    if not check_rate_limit_chat(ip):
        return JSONResponse({"detail": "rate_limited"}, status_code=429)

    try:
        # Récupère un k élargi pour pouvoir filtrer côté Python sans trop perdre.
        k = min(body.limit * 4 + body.offset, 80)
        rows = await asyncio.to_thread(retriever.search, body.q.strip(), k)
    except Exception as e:
        logger.exception("semantic search failed")
        return JSONResponse({"detail": str(e)}, status_code=502)

    filtered: list[dict[str, Any]] = []
    for r in rows:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        if not _matches_source_filter(meta, body.sources):
            continue
        if not _matches_date_range(meta, body.date_from, body.date_to):
            continue
        filtered.append(r)

    total = len(filtered)
    sliced = filtered[body.offset : body.offset + body.limit]

    hits: list[SemanticSearchHit] = []
    for r in sliced:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        slug = (meta.get("slug") or None) if isinstance(meta.get("slug"), str) else None
        # Reconstruit le titre depuis citation ou titre stocké
        titre = str(meta.get("titre") or meta.get("code") or r.get("citation") or "Document indexé")[:300]
        article_numero = meta.get("numero_article")
        autorite = str(meta.get("autorite") or "").lower()
        source_slug: str | None = None
        for slg, kws in _URL_SLUG_KEYWORDS.items():
            if any(kw in autorite for kw in kws):
                source_slug = slg
                break

        hits.append(
            SemanticSearchHit(
                slug=slug,
                source=source_slug,
                sourceLabel=str(meta.get("autorite") or "") or None,
                titre=titre,
                resume=(str(r.get("text", ""))[:300] or None),
                type=str(meta.get("type") or "") or None,
                reference=str(meta.get("reference") or "") or None,
                datePublication=str(meta.get("date") or "") or None,
                estEnVigueur=True,
                articleNumero=str(article_numero) if isinstance(article_numero, (str, int)) else None,
                score=float(r.get("score", 0.0)),
            )
        )

    return SemanticSearchResponse(hits=hits, total=total)
