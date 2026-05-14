"""Retriever ChromaDB + embeddings multilingues (fusion uploads session, hybride léger)."""
from __future__ import annotations

import logging
import re
from typing import Any

import chromadb
from chromadb.utils import embedding_functions

from src.config import get_settings
from src.rag import uploads_store

logger = logging.getLogger(__name__)

_ef: embedding_functions.SentenceTransformerEmbeddingFunction | None = None
_collection: Any = None


def _get_collection():
    global _ef, _collection
    if _collection is not None:
        return _collection
    s = get_settings()
    _ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=s.chroma_embedding_model,
    )
    client = chromadb.PersistentClient(path=s.chroma_path)
    _collection = client.get_or_create_collection(
        name=s.chroma_collection,
        embedding_function=_ef,
        metadata={"hnsw:space": "cosine"},
    )
    return _collection


def _tokenize_fr(text: str) -> set[str]:
    return set(re.findall(r"[a-zàâäéèêëïîôùûüçœæ0-9]+", text.lower()))


def _overlap_score(doc_text: str, query: str) -> float:
    qt = _tokenize_fr(query)
    if not qt:
        return 0.0
    tt = _tokenize_fr(doc_text)
    inter = len(qt & tt)
    return inter / max(len(qt), 1)


def _hybrid_rescore(rows: list[dict[str, Any]], query: str, k: int) -> list[dict[str, Any]]:
    """Re-score vectoriel + recouvrement lexical (léger, pas BM25)."""
    scored: list[tuple[float, dict[str, Any]]] = []
    for r in rows:
        vec = float(r.get("score", 0.5))
        ov = _overlap_score(r.get("text") or "", query)
        combined = 0.62 * vec + 0.38 * min(1.0, ov)
        scored.append((combined, r))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in scored[:k]]


def _maybe_rerank_overlap(rows: list[dict[str, Any]], query: str, k: int) -> list[dict[str, Any]]:
    s = get_settings()
    if not s.use_rerank or not rows:
        return rows[:k]
    scored = sorted(rows, key=lambda r: _overlap_score(r.get("text") or "", query), reverse=True)
    return scored[:k]


def _rows_from_chroma_result(res: dict[str, Any], k: int) -> list[dict[str, Any]]:
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
        citation = (meta or {}).get("citation") or (meta or {}).get("titre") or str(doc_id)
        out.append(
            {
                "id": doc_id,
                "text": text,
                "citation": str(citation),
                "score": score,
                "metadata": meta or {},
            }
        )
    return out


def search_main(query: str, k: int | None = None) -> list[dict[str, Any]]:
    """Recherche dans la collection principale (option hybride : n_results élargi + re-score)."""
    s = get_settings()
    k = k or s.rag_top_k
    col = _get_collection()
    n_fetch = k * 2 if s.use_hybrid_rag else k
    try:
        res = col.query(query_texts=[query], n_results=max(1, n_fetch))
    except Exception as e:
        logger.warning("chroma query failed: %s", e)
        return []
    rows = _rows_from_chroma_result(res, n_fetch)
    if s.use_hybrid_rag:
        rows = _hybrid_rescore(rows, query, k)
    else:
        rows = rows[:k]
    rows = _maybe_rerank_overlap(rows, query, k)
    return rows


def merge_search_results(
    main: list[dict[str, Any]],
    uploads: list[dict[str, Any]],
    k: int,
    query: str,
) -> list[dict[str, Any]]:
    """Concatène corpus principal + uploads, déduplique par id, trie par score."""
    s = get_settings()
    seen: set[str] = set()
    merged: list[dict[str, Any]] = []
    for r in main + uploads:
        rid = str(r.get("id") or r.get("citation") or "")
        if not rid or rid in seen:
            continue
        seen.add(rid)
        merged.append(r)
    merged.sort(key=lambda x: float(x.get("score", 0)), reverse=True)
    merged = merged[: max(k, 1)]
    return _maybe_rerank_overlap(merged, query, k) if s.use_rerank else merged[:k]


def search_expanded(
    query: str,
    k: int | None = None,
    *,
    domaine: str | None = None,
) -> list[dict[str, Any]]:
    """Plusieurs requêtes (question + variante domaine) fusionnées par id, score max conservé."""
    from src.agent.prompts import rag_search_query_variants

    k = k or get_settings().rag_top_k
    variants = rag_search_query_variants(query, domaine)
    by_id: dict[str, dict[str, Any]] = {}
    for v in variants:
        rows = search_main(v, k)
        for r in rows:
            rid = str(r.get("id") or "")
            if not rid:
                continue
            sc = float(r.get("score", 0))
            prev = by_id.get(rid)
            if prev is None or sc > float(prev.get("score", 0)):
                by_id[rid] = dict(r)
    merged = sorted(by_id.values(), key=lambda x: float(x.get("score", 0)), reverse=True)
    merged = merged[:k]
    return _maybe_rerank_overlap(merged, query, k)


def search(
    query: str,
    k: int | None = None,
    *,
    session_id: str | None = None,
    include_uploads: bool = False,
    domaine: str | None = None,
) -> list[dict[str, Any]]:
    """Recherche principale ; fusionne les chunks PDF de session si demandé."""
    s = get_settings()
    k = k or s.rag_top_k
    main = search_expanded(query, k, domaine=domaine)
    if not include_uploads or not session_id:
        return main
    up = uploads_store.search_session_uploads(session_id, query, min(k, 8))
    return merge_search_results(main, up, k, query)
