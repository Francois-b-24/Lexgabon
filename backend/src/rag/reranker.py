"""Cross-encoder reranker (BAAI/bge-reranker-v2-m3, CPU).

API publique :
    rerank(query, candidates, top_k) -> list[Row]

Le modèle est chargé en singleton au premier appel (lazy).
Sur CPU ~30-80 ms pour 12 candidats — acceptable pour une requête RAG.
"""
from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

Row = dict[str, Any]

_RERANKER_MODEL = "BAAI/bge-reranker-v2-m3"

_reranker = None  # singleton CrossEncoder


def _get_reranker():
    global _reranker
    if _reranker is not None:
        return _reranker
    try:
        from sentence_transformers import CrossEncoder
        _reranker = CrossEncoder(_RERANKER_MODEL, max_length=512)
        logger.info("reranker chargé : %s", _RERANKER_MODEL)
    except Exception as e:
        logger.warning("reranker indisponible (%s) — bypass", e)
        _reranker = None
    return _reranker


def rerank(query: str, candidates: list[Row], top_k: int) -> list[Row]:
    """Reranke les candidats par pertinence croisée query/document.

    Retourne les top_k meilleurs selon le cross-encoder.
    Si le modèle est indisponible ou la liste vide, retourne candidates[:top_k].
    """
    if not candidates:
        return candidates
    if top_k >= len(candidates):
        # Pas besoin de reranker si on garde tout.
        return candidates

    ce = _get_reranker()
    if ce is None:
        return candidates[:top_k]

    pairs = [(query, r.get("text") or "") for r in candidates]
    try:
        scores = ce.predict(pairs, show_progress_bar=False)
    except Exception as e:
        logger.warning("reranker.predict failed (%s) — bypass", e)
        return candidates[:top_k]

    scored = sorted(zip(scores, candidates), key=lambda x: float(x[0]), reverse=True)
    # Injecte le score cross-encoder dans la row pour le logger loguru.
    result = []
    for ce_score, row in scored[:top_k]:
        r = dict(row)
        r["score_rerank"] = round(float(ce_score), 4)
        result.append(r)
    return result
