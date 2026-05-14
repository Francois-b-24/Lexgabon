"""Application FastAPI — /health répond vite (imports lourds chargés seulement avec les routes chat)."""
import logging
import threading
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="LexGabon Legal Agent", version="0.1.0")

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
    """Ne doit pas importer Chroma / sentence-transformers (cold start Render + proxy Vercel)."""
    return {"status": "ok"}


from src.routes.chat import router as chat_router

app.include_router(chat_router, prefix="")


def _background_warm_rag() -> None:
    """Précharge Chroma / embeddings après le démarrage pour raccourcir le 1er chat (ne bloque pas /health)."""
    time.sleep(3)
    try:
        from src.rag import retriever

        retriever.search_main("droit", k=1)
        logging.getLogger(__name__).info("RAG warm-up completed")
    except Exception:
        logging.getLogger(__name__).warning("RAG warm-up skipped", exc_info=True)


threading.Thread(target=_background_warm_rag, daemon=True, name="rag-warm").start()
