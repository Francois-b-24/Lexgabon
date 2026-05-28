"""Tests unitaires du reranker cross-encoder (src/rag/reranker.py).

Le CrossEncoder n'est pas chargé : on mocke `_get_reranker` pour rester
indépendant du modèle et des ressources réseau/CPU.
"""
from __future__ import annotations

import pytest

from src.rag import reranker


def _row(idx: int, text: str = "") -> dict:
    return {
        "id": f"id{idx}",
        "text": text or f"texte du document {idx}",
        "score": 0.8,
        "citation": f"Code X — Article {idx}",
        "metadata": {"numero_article": str(idx)},
    }


class _FakeCE:
    """CrossEncoder factice : score = longueur du doc (pour tester le tri)."""
    def predict(self, pairs, show_progress_bar=False):  # noqa: ANN001
        return [float(len(doc)) for _, doc in pairs]


def test_rerank_orders_by_cross_encoder_score(monkeypatch):
    monkeypatch.setattr(reranker, "_get_reranker", lambda: _FakeCE())
    rows = [
        _row(1, "court"),
        _row(2, "document beaucoup plus long avec beaucoup de mots"),
        _row(3, "moyen texte ici"),
    ]
    result = reranker.rerank("requête", rows, top_k=2)
    assert len(result) == 2
    # Le plus long doit être premier (score = len).
    assert result[0]["id"] == "id2"


def test_rerank_injects_score_rerank(monkeypatch):
    monkeypatch.setattr(reranker, "_get_reranker", lambda: _FakeCE())
    # top_k < len(candidates) pour forcer le chemin CrossEncoder
    rows = [_row(1, "abc"), _row(2, "ab"), _row(3, "abcdef")]
    result = reranker.rerank("q", rows, top_k=2)
    assert len(result) == 2
    assert all("score_rerank" in r for r in result)


def test_rerank_top_k_respected(monkeypatch):
    monkeypatch.setattr(reranker, "_get_reranker", lambda: _FakeCE())
    rows = [_row(i, "x" * i) for i in range(1, 10)]
    result = reranker.rerank("q", rows, top_k=3)
    assert len(result) == 3


def test_rerank_empty_returns_empty(monkeypatch):
    monkeypatch.setattr(reranker, "_get_reranker", lambda: _FakeCE())
    assert reranker.rerank("q", [], top_k=6) == []


def test_rerank_top_k_ge_candidates_no_filter(monkeypatch):
    """top_k ≥ len(candidates) : retourne tout sans appeler le modèle."""
    called = {"n": 0}

    class _CE:
        def predict(self, pairs, **kw):
            called["n"] += 1
            return [1.0] * len(pairs)

    monkeypatch.setattr(reranker, "_get_reranker", lambda: _CE())
    rows = [_row(i) for i in range(3)]
    result = reranker.rerank("q", rows, top_k=10)
    assert called["n"] == 0  # predict non appelé
    assert len(result) == 3


def test_rerank_bypasses_when_model_unavailable(monkeypatch):
    """Si le modèle ne peut pas se charger, retourne candidates[:top_k] sans erreur."""
    monkeypatch.setattr(reranker, "_get_reranker", lambda: None)
    rows = [_row(i) for i in range(8)]
    result = reranker.rerank("q", rows, top_k=4)
    assert len(result) == 4
    assert result[0]["id"] == "id0"


def test_reranker_wired_in_search_expanded(monkeypatch):
    """search_expanded appelle rerank quand use_cross_encoder=True."""
    from src.rag import retriever

    # Mock collection Chroma
    class _FakeCol:
        def query(self, *, query_embeddings, n_results, where=None):
            ids = [f"id{i}" for i in range(n_results)]
            docs = [f"doc {i} " * 10 for i in range(n_results)]
            metas = [{"domaine": "travail", "numero_article": str(i)} for i in range(n_results)]
            dists = [0.1] * n_results
            return {"ids": [ids], "documents": [docs], "metadatas": [metas], "distances": [dists]}

    monkeypatch.setattr(retriever, "_get_collection", lambda: _FakeCol())
    monkeypatch.setattr(retriever, "_ef", object())
    monkeypatch.setattr(retriever, "embed_query_text", lambda ef, q: [0.0] * 768)
    monkeypatch.setattr(retriever, "_known_domaines", lambda: set())
    monkeypatch.setattr("src.agent.prompts.rag_search_query_variants", lambda q, d: [q])

    rerank_calls = {"n": 0}

    def _fake_rerank(query, candidates, top_k):
        rerank_calls["n"] += 1
        return candidates[:top_k]

    monkeypatch.setattr("src.rag.reranker.rerank", _fake_rerank)
    monkeypatch.setattr(retriever.get_settings(), "use_cross_encoder", True, raising=False)

    retriever.search_expanded("licenciement abusif", domaine=None)
    assert rerank_calls["n"] >= 1
