"""Application FastAPI — /health minimal au chargement ; routes chat montées au lifespan."""
from __future__ import annotations

import logging
import threading
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings

logging.basicConfig(level=logging.INFO)


def _background_warm_rag() -> None:
    """Précharge Chroma / embeddings (optionnel). Peut saturer CPU/RAM sur Render faible — désactivé par défaut."""
    time.sleep(3)
    try:
        from src.rag import retriever

        retriever.search_main("droit", k=1)
        logging.getLogger(__name__).info("RAG warm-up completed")
    except Exception:
        logging.getLogger(__name__).warning("RAG warm-up skipped", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Monte les routes chat + recherche + corpus status au lifespan."""
    from src.routes.chat import router as chat_router
    from src.routes.search import router as search_router
    from src.routes.corpus_status import router as corpus_router

    app.include_router(chat_router, prefix="")
    app.include_router(search_router, prefix="")
    app.include_router(corpus_router, prefix="")
    if get_settings().warm_rag_on_startup:
        threading.Thread(target=_background_warm_rag, daemon=True, name="rag-warm").start()
    yield


app = FastAPI(title="LexGabon Legal Agent", version="0.1.0", lifespan=lifespan)

s = get_settings()
origins = [o.strip() for o in s.frontend_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-Id"] = rid
    return response


@app.get("/health")
def health():
    """Réponse minimale — ne charge pas Chroma ni les routes lourdes (cf. lifespan)."""
    return {"status": "ok"}
