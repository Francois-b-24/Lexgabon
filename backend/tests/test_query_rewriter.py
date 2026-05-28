"""Tests unitaires du query rewriter et de la fusion RRF (étape 5).

On mocke l'appel Anthropic pour ne pas dépendre du réseau.
"""
from __future__ import annotations

import pytest


# ── query_rewriter ────────────────────────────────────────────────────────────

def test_rewrite_returns_two_variants(monkeypatch):
    """rewrite() retourne jusqu'à 2 variantes distinctes de la question."""
    from src.rag import query_rewriter

    monkeypatch.setattr(
        query_rewriter,
        "_rewrite_cached",
        lambda key, q: ("Quelles dispositions régissent le licenciement ?",
                        "Quelles règles encadrent la rupture du contrat de travail ?"),
    )
    result = query_rewriter.rewrite("Comment licencier un salarié ?")
    assert len(result) == 2
    assert all(isinstance(v, str) and v for v in result)


def test_rewrite_filters_identical_to_original(monkeypatch):
    """Une variante identique (normalisée) à l'original est filtrée."""
    from src.rag import query_rewriter

    monkeypatch.setattr(
        query_rewriter,
        "_rewrite_cached",
        lambda key, q: (q, "Variante différente valide"),  # 1er = identique
    )
    result = query_rewriter.rewrite("licenciement abusif")
    assert len(result) == 1
    assert result[0] == "Variante différente valide"


def test_rewrite_returns_empty_on_api_failure(monkeypatch):
    """Si l'API échoue, rewrite() retourne [] sans lever d'exception."""
    from src.rag import query_rewriter

    monkeypatch.setattr(query_rewriter, "_rewrite_cached", lambda key, q: ())
    result = query_rewriter.rewrite("question quelconque")
    assert result == []


def test_rewrite_empty_question():
    from src.rag import query_rewriter
    assert query_rewriter.rewrite("") == []
    assert query_rewriter.rewrite("   ") == []


def test_rewrite_lru_cache_hits_on_second_call(monkeypatch):
    """Deux appels à rewrite avec la même question génèrent un cache hit LRU."""
    from src.rag import query_rewriter

    # Neutralise l'appel Anthropic pour ne pas dépendre du réseau.
    monkeypatch.setattr(
        query_rewriter,
        "_rewrite_cached",
        query_rewriter._rewrite_cached,  # on garde la vraie fonction cachée
    )
    # Patch anthropic.Anthropic pour retourner un résultat factice.
    class _FakeMsg:
        content = [type("B", (), {"text": "v1\nv2"})()]

    class _FakeClient:
        def __init__(self, **kw): pass
        class messages:
            @staticmethod
            def create(**kw): return _FakeMsg()

    import anthropic
    monkeypatch.setattr(anthropic, "Anthropic", _FakeClient)

    query_rewriter._rewrite_cached.cache_clear()
    query_rewriter.rewrite("question LRU test unique 42")
    info_after_first = query_rewriter._rewrite_cached.cache_info()
    query_rewriter.rewrite("question LRU test unique 42")
    info_after_second = query_rewriter._rewrite_cached.cache_info()

    assert info_after_second.hits > info_after_first.hits


# ── RRF fusion ────────────────────────────────────────────────────────────────

def test_rrf_fuse_ranks_by_combined_score():
    """Un doc présent dans deux listes remonte devant un doc présent dans une seule."""
    from src.rag.retriever import _rrf_fuse

    def _row(i):
        return {"id": f"id{i}", "text": f"doc{i}", "score": 0.9, "metadata": {}}

    # id1 apparaît dans les deux listes (rang 1 + rang 1) → score RRF élevé
    # id2 et id3 n'apparaissent qu'une fois
    list_a = [_row(1), _row(2)]
    list_b = [_row(1), _row(3)]
    fused = _rrf_fuse([list_a, list_b])
    sorted_ids = sorted(fused, key=lambda rid: fused[rid]["score"], reverse=True)
    assert sorted_ids[0] == "id1"


def test_rrf_fuse_empty_lists():
    from src.rag.retriever import _rrf_fuse
    assert _rrf_fuse([]) == {}
    assert _rrf_fuse([[]]) == {}


def test_rrf_fuse_single_list_preserves_order():
    """Avec une seule liste, l'ordre RRF reflète le rang d'origine."""
    from src.rag.retriever import _rrf_fuse

    rows = [{"id": f"id{i}", "text": "", "score": 0.9, "metadata": {}} for i in range(5)]
    fused = _rrf_fuse([rows])
    sorted_ids = sorted(fused, key=lambda rid: fused[rid]["score"], reverse=True)
    assert sorted_ids == ["id0", "id1", "id2", "id3", "id4"]


def test_rrf_k60_parameter_effect():
    """k_rrf=60 produit des scores différents de k_rrf=1."""
    from src.rag.retriever import _rrf_fuse

    row = [{"id": "x", "text": "", "score": 0.9, "metadata": {}}]
    score_60 = _rrf_fuse([row], k_rrf=60)["x"]["score"]
    score_1 = _rrf_fuse([row], k_rrf=1)["x"]["score"]
    assert score_60 < score_1  # 1/(60+1) < 1/(1+1)


def test_search_expanded_uses_rrf_when_rewriter_active(monkeypatch):
    """search_expanded appelle _rrf_fuse quand use_query_rewriter=True."""
    from src.rag import retriever

    class _FakeCol:
        def query(self, *, query_embeddings, n_results, where=None):
            ids = [f"id{i}" for i in range(n_results)]
            docs = [f"doc {i}" for i in range(n_results)]
            metas = [{"domaine": "travail", "numero_article": str(i)} for i in range(n_results)]
            dists = [0.1] * n_results
            return {"ids": [ids], "documents": [docs], "metadatas": [metas], "distances": [dists]}

    monkeypatch.setattr(retriever, "_get_collection", lambda: _FakeCol())
    monkeypatch.setattr(retriever, "_ef", object())
    monkeypatch.setattr(retriever, "embed_query_text", lambda ef, q: [0.0] * 768)
    monkeypatch.setattr(retriever, "_known_domaines", lambda: set())
    monkeypatch.setattr("src.agent.prompts.rag_search_query_variants", lambda q, d: [q])
    # Rewriter retourne 1 variante
    monkeypatch.setattr("src.rag.query_rewriter.rewrite", lambda q: ["variante juridique"])
    monkeypatch.setattr(retriever.get_settings(), "use_query_rewriter", True, raising=False)
    monkeypatch.setattr(retriever.get_settings(), "use_cross_encoder", False, raising=False)

    rrf_calls = {"n": 0}
    _orig_rrf = retriever._rrf_fuse

    def _spy_rrf(ranked_lists, k_rrf=60):
        rrf_calls["n"] += 1
        return _orig_rrf(ranked_lists, k_rrf=k_rrf)

    monkeypatch.setattr(retriever, "_rrf_fuse", _spy_rrf)
    retriever.search_expanded("durée du travail")
    assert rrf_calls["n"] >= 1
