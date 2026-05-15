"""Stockage Chroma des extraits PDF téléversés par session (CDC)."""
from __future__ import annotations

import hashlib
import logging
import uuid
from typing import Any

import chromadb
from chromadb.utils import embedding_functions

from src.config import get_settings
from src.rag.chunking import chunk_text, extract_pdf_text

logger = logging.getLogger(__name__)

_ef: embedding_functions.SentenceTransformerEmbeddingFunction | None = None
_upload_collection: Any = None


def _get_upload_collection():
    global _ef, _upload_collection
    if _upload_collection is not None:
        return _upload_collection
    s = get_settings()
    _ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=s.chroma_embedding_model,
    )
    client = chromadb.PersistentClient(path=s.chroma_path)
    _upload_collection = client.get_or_create_collection(
        name=s.chroma_uploads_collection,
        embedding_function=_ef,
        metadata={"hnsw:space": "cosine"},
    )
    return _upload_collection


def add_pdf_chunks(session_id: str, filename: str, data: bytes) -> int:
    text = extract_pdf_text(data)
    chunks = chunk_text(text)
    if not chunks:
        return 0
    col = _get_upload_collection()
    base = f"{session_id}:{filename}:{uuid.uuid4().hex}"
    ids = [f"{base}:{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "session_id": session_id,
            "source_filename": filename,
            "citation": f"Téléversement — {filename}",
        }
        for _ in chunks
    ]
    col.add(ids=ids, documents=chunks, metadatas=metadatas)
    return len(chunks)


def _fetch_source_key_for_url(session_id: str, url: str) -> str:
    h = hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]
    return f"url:{session_id}:{h}"


def delete_chunks_by_fetch_source_id(fetch_source_id: str) -> None:
    try:
        col = _get_upload_collection()
        col.delete(where={"fetch_source_id": fetch_source_id})
    except Exception as e:
        logger.warning("delete_chunks_by_fetch_source_id failed: %s", e)


def add_url_index_chunks(session_id: str, url: str, title: str, plain_text: str) -> int:
    """Indexe le texte d'une URL allowlistée dans la collection uploads (remplace un précédent même URL)."""
    chunks = chunk_text(plain_text)
    if not chunks:
        return 0
    fetch_key = _fetch_source_key_for_url(session_id, url)
    delete_chunks_by_fetch_source_id(fetch_key)
    col = _get_upload_collection()
    base = f"{session_id}:url:{uuid.uuid4().hex}"
    ids = [f"{base}:{i}" for i in range(len(chunks))]
    cit = f"{title} — {url}" if title else url
    metadatas = [
        {
            "session_id": session_id,
            "source_filename": title[:500] or url[:500],
            "citation": cit[:4000],
            "url": url[:4000],
            "fetch_source_id": fetch_key,
        }
        for _ in chunks
    ]
    col.add(ids=ids, documents=chunks, metadatas=metadatas)
    return len(chunks)


def search_session_uploads(session_id: str, query: str, k: int) -> list[dict[str, Any]]:
    col = _get_upload_collection()
    try:
        res = col.query(
            query_texts=[query],
            n_results=k,
            where={"session_id": session_id},
        )
    except Exception as e:
        logger.warning("upload chroma query failed: %s", e)
        return []
    ids = (res.get("ids") or [[]])[0]
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0]
    out: list[dict[str, Any]] = []
    for i, doc_id in enumerate(ids):
        text = docs[i] if i < len(docs) else ""
        meta = metas[i] if i < len(metas) else {}
        dist = dists[i] if i < len(dists) else 1.0
        score = max(0.0, 1.0 - float(dist) / 2.0) if dist is not None else 0.5
        citation = (meta or {}).get("citation") or str(doc_id)
        out.append(
            {
                "id": doc_id,
                "text": text,
                "citation": str(citation),
                "score": score,
                "metadata": meta or {},
                "badge": "upload",
            }
        )
    return out


def clear_session_uploads(session_id: str) -> None:
    try:
        col = _get_upload_collection()
        col.delete(where={"session_id": session_id})
    except Exception as e:
        logger.warning("clear_session_uploads failed: %s", e)
