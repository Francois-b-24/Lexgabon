"""Routes /api/chat, /api/chat/stream, /api/session/clear, /api/upload-pdf."""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, AsyncIterator

from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from src.agent.prompts import answer_has_citation, answer_has_disclaimer, build_user_message, collect_server_warnings
from src.agent.schemas import ChatRequest, ChatResponse, Quality, SessionClearRequest, SourceItem, StructuredCitation
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
    dom = body.domaine
    if h and h[-1].get("role") == "user":
        h[-1] = {
            **h[-1],
            "content": build_user_message(body.question, dom),
        }
    elif not h:
        h = [{"role": "user", "content": build_user_message(body.question, dom)}]
    else:
        h.append({"role": "user", "content": build_user_message(body.question, dom)})
    return h


def _build_citations(sources: list[dict[str, Any]]) -> list[StructuredCitation]:
    out: list[StructuredCitation] = []
    for s in sources[:20]:
        meta = s.get("metadata") if isinstance(s.get("metadata"), dict) else {}
        sid_s = s.get("id") or meta.get("id")
        if isinstance(sid_s, str | int):
            sid_out: str | None = str(sid_s)
        else:
            sid_out = None
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
    if not get_settings().anthropic_api_key:
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

    from src.agent.agent import LegalAgent

    agent = LegalAgent()
    try:
        # Ne pas bloquer la boucle asyncio : sinon /health et les autres requêtes
        # attendent la fin du chat (~2 min) et les proxies Vercel timeout.
        out = await asyncio.to_thread(
            agent.answer,
            body.question,
            body.domaine,
            hist,
            session_id=sid,
            include_uploads=body.include_uploads,
        )
    except Exception as e:
        logger.exception("agent failed")
        return JSONResponse({"detail": str(e)}, status_code=502)

    sources = [
        SourceItem(
            citation=s.get("citation", ""),
            text=s.get("text", ""),
            score=float(s.get("score", 0)),
            badge=str(s.get("badge", "doc")),
        )
        for s in out.sources[:20]
    ]
    quality = Quality(has_citation=answer_has_citation(out.text), has_disclaimer=answer_has_disclaimer(out.text))
    warnings = collect_server_warnings(out.text, out.sources)
    s = get_settings()
    citations: list[StructuredCitation] | None = None
    if s.rag_structured_citations:
        citations = _build_citations(out.sources)

    clean = [{"role": m["role"], "content": m["content"]} for m in hist]
    clean.append({"role": "assistant", "content": out.text})
    max_m = get_settings().session_max_messages
    store.set_history(sid, clean[-max_m:])

    return ChatResponse(
        answer=out.text,
        sources=sources,
        quality=quality,
        session_id=sid,
        tools_used=out.tools_used,
        source_stats={"count": len(sources)},
        citations=citations,
        warnings=warnings,
    )


@router.post("/api/session/clear")
async def api_session_clear(body: SessionClearRequest):
    from src.rag import uploads_store

    get_session_store().clear(body.session_id)
    uploads_store.clear_session_uploads(body.session_id)
    return {"ok": True, "session_id": body.session_id}


@router.post("/api/upload-pdf")
async def api_upload_pdf(
    request: Request,
    session_id: str = Form(...),
    file: UploadFile = File(...),
):
    if not session_id.strip():
        return JSONResponse({"detail": "session_id requis"}, status_code=400)
    ip = _client_ip(request)
    if not check_rate_limit_chat(ip):
        return JSONResponse({"detail": "rate_limited"}, status_code=429)
    s = get_settings()
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        return JSONResponse({"detail": "type MIME attendu : application/pdf"}, status_code=400)
    data = await file.read()
    if len(data) > s.max_upload_pdf_bytes:
        return JSONResponse(
            {"detail": f"fichier trop volumineux (max {s.max_upload_pdf_bytes} octets)"},
            status_code=413,
        )
    from src.rag import uploads_store

    try:
        n = await asyncio.to_thread(
            uploads_store.add_pdf_chunks,
            session_id,
            file.filename or "document.pdf",
            data,
        )
    except Exception as e:
        logger.exception("upload pdf failed")
        return JSONResponse({"detail": str(e)}, status_code=400)
    return {"ok": True, "chunks": n}


@router.post("/api/chat/stream")
async def api_chat_stream(request: Request, body: ChatRequest):
    """SSE : deltas texte réels puis événement final (CDC)."""
    if not get_settings().anthropic_api_key:
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

    async def gen() -> AsyncIterator[bytes]:
        from src.agent.agent import LegalAgent

        out_holder: dict[str, Any] = {}
        try:
            ag = LegalAgent()
            for token in ag.stream_final_answer(
                body.question,
                body.domaine,
                hist,
                session_id=sid,
                include_uploads=body.include_uploads,
                out=out_holder,
            ):
                yield f"data: {json.dumps({'type': 'token', 'text': token}, ensure_ascii=False)}\n\n".encode()
            ans = out_holder.get("answer")
            if not ans:
                yield f"data: {json.dumps({'type': 'error', 'detail': 'empty_response'})}\n\n".encode()
                return
            text = ans.text
            sources = [
                {"citation": s.get("citation", ""), "text": s.get("text", ""), "score": s.get("score", 0), "badge": s.get("badge", "doc")}
                for s in ans.sources[:20]
            ]
            quality = {
                "has_citation": answer_has_citation(text),
                "has_disclaimer": answer_has_disclaimer(text),
            }
            warnings = collect_server_warnings(text, ans.sources)
            meta: dict[str, Any] = {
                "type": "done",
                "answer": text,
                "sources": sources,
                "quality": quality,
                "session_id": sid,
                "tools_used": ans.tools_used,
                "warnings": warnings,
            }
            if get_settings().rag_structured_citations:
                meta["citations"] = [c.model_dump() for c in _build_citations(ans.sources)]
            yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n".encode()
            clean = [{"role": m["role"], "content": m["content"]} for m in hist]
            clean.append({"role": "assistant", "content": text})
            max_m = get_settings().session_max_messages
            store.set_history(sid, clean[-max_m:])
        except Exception as e:
            logger.exception("stream failed")
            yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n".encode()

    return StreamingResponse(gen(), media_type="text/event-stream")
