"""Route /api/chat — point d'entrée unique du chatbot."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.agent.chat_engine import run_chat
from src.agent.prompts import (
    answer_has_citation,
    answer_has_disclaimer,
    append_indexed_source_lines_if_needed,
    build_user_message,
    strip_citation_markers,
)
from src.agent.response_parser import parse_legal_note
from src.agent.schemas import (
    ChatRequest,
    ChatResponse,
    Quality,
    SourceItem,
    StructuredAnswer,
    StructuredCitation,
)
from src.config import get_settings
from src.rate_limit import check_rate_limit_chat
from src.session_store import get_session_store, new_session_id

logger = logging.getLogger(__name__)

router = APIRouter()


def _client_ip(request: Request) -> str:
    xf = request.headers.get("x-forwarded-for")
    if xf:
        return xf.split(",")[0].strip()
    if request.client:
        return request.client.host or "local"
    return "local"


def _prepare_history(body: ChatRequest) -> list[dict[str, str]]:
    h = [x.model_dump() for x in body.history]
    if h and h[-1].get("role") == "user":
        h[-1] = {**h[-1], "content": build_user_message(body.question, body.domaine)}
    elif not h:
        h = [{"role": "user", "content": build_user_message(body.question, body.domaine)}]
    else:
        h.append({"role": "user", "content": build_user_message(body.question, body.domaine)})
    return h


_SOURCE_CODE_TO_URL_SLUG: dict[str, str] = {
    "JOG": "jo-ga",
    "JO-GA": "jo-ga",
    "GABON": "jo-ga",
    "OHADA": "ohada",
    "CEMAC": "cemac",
    "COBAC": "cobac",
    "CIMA": "cima",
}


def _derive_source_url_slug(meta: dict[str, Any]) -> str | None:
    """Récupère le slug d'URL (jo-ga, ohada, ...) depuis les métadonnées Chroma.

    Préférence : `source_code` (JOG, OHADA, ...) → mapping ; fallback heuristique
    sur `autorite` ou `code` si la métadonnée n'a pas été posée à l'ingestion.
    """
    raw_code = meta.get("source_code")
    if isinstance(raw_code, str) and raw_code.strip():
        mapped = _SOURCE_CODE_TO_URL_SLUG.get(raw_code.strip().upper())
        if mapped:
            return mapped
    autorite = str(meta.get("autorite") or "").lower()
    if "gabon" in autorite:
        return "jo-ga"
    if "ohada" in autorite:
        return "ohada"
    if "cemac" in autorite:
        return "cemac"
    if "cobac" in autorite:
        return "cobac"
    if "cima" in autorite:
        return "cima"
    return None


def _source_item_from_row(src: dict[str, Any]) -> SourceItem:
    meta = src.get("metadata") if isinstance(src.get("metadata"), dict) else {}
    slug_raw = meta.get("slug")
    slug_out: str | None = slug_raw.strip() if isinstance(slug_raw, str) and slug_raw.strip() else None
    url_raw = meta.get("url")
    url_out: str | None = url_raw.strip() if isinstance(url_raw, str) and url_raw.strip() else None
    raw_num = meta.get("numero_article")
    num_out: str | None = None
    if raw_num is not None:
        ns = str(raw_num).strip()
        if ns and ns != "—":
            num_out = ns
    return SourceItem(
        citation=str(src.get("citation", "")),
        text=str(src.get("text", "")),
        score=float(src.get("score", 0)),
        badge=str(src.get("badge", "doc")),
        slug=slug_out,
        numero_article=num_out,
        url=url_out,
        source=_derive_source_url_slug(meta),
    )


def _build_citations(sources: list[dict[str, Any]]) -> list[StructuredCitation]:
    out: list[StructuredCitation] = []
    for s in sources[:20]:
        sid_raw = s.get("id")
        sid_out: str | None = str(sid_raw) if isinstance(sid_raw, str | int) else None
        out.append(
            StructuredCitation(
                citation=str(s.get("citation", "")),
                text=str(s.get("text", ""))[:2000],
                score=float(s.get("score", 0)),
                source_id=sid_out,
            )
        )
    return out


@router.post("/api/chat")
async def api_chat(request: Request, body: ChatRequest):
    s = get_settings()
    if not s.anthropic_api_key:
        return JSONResponse({"detail": "ANTHROPIC_API_KEY manquant"}, status_code=503)
    ip = _client_ip(request)
    if not check_rate_limit_chat(ip):
        return JSONResponse({"detail": "rate_limited"}, status_code=429)

    store = get_session_store()
    sid = body.session_id or new_session_id()

    hist = [x.model_dump() for x in body.history]
    if not hist:
        loaded = store.get_history(sid)
        if loaded:
            hist = [{"role": m["role"], "content": m["content"]} for m in loaded]
            hist.append({"role": "user", "content": build_user_message(body.question, body.domaine)})
        else:
            hist = [{"role": "user", "content": build_user_message(body.question, body.domaine)}]
    else:
        hist = _prepare_history(body)

    try:
        out = await asyncio.to_thread(
            run_chat,
            body.question,
            body.domaine,
            hist,
            profile=body.profile,
        )
    except Exception as e:
        logger.exception("chat failed")
        return JSONResponse({"detail": str(e)}, status_code=502)

    # Profil non_juriste : pas de citations, pas de sources rendues côté front, pas de structured.
    # Filet de sécurité — le prompt système l'interdit déjà côté LLM.
    is_non_juriste = body.profile == "non_juriste"

    if is_non_juriste:
        out_text = strip_citation_markers(out.text)
        sources: list[SourceItem] = []
    else:
        out_text = append_indexed_source_lines_if_needed(out.text, out.sources)
        sources = [_source_item_from_row(src) for src in out.sources[:20]]

    quality = Quality(
        has_citation=answer_has_citation(out_text),
        has_disclaimer=answer_has_disclaimer(out_text),
    )
    citations: list[StructuredCitation] | None = None
    if s.rag_structured_citations and not is_non_juriste:
        citations = _build_citations(out.sources)

    structured: StructuredAnswer | None = None
    if not is_non_juriste:
        try:
            structured = parse_legal_note(out_text, sources)
            if not structured.paragraphs and not structured.disclaimer:
                structured = None
        except Exception:
            logger.exception("legal note parsing failed; falling back to plain answer")
            structured = None

    clean = [{"role": m["role"], "content": m["content"]} for m in hist]
    clean.append({"role": "assistant", "content": out_text})
    store.set_history(sid, clean[-s.session_max_messages:])

    return ChatResponse(
        answer=out_text,
        sources=sources,
        quality=quality,
        session_id=sid,
        source_stats={"count": len(sources)},
        citations=citations,
        structured=structured,
    )
