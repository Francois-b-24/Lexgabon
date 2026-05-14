"""Application FastAPI."""
import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.routes.chat import router as chat_router

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


app.include_router(chat_router, prefix="")


@app.get("/health")
def health():
    return {"status": "ok"}
