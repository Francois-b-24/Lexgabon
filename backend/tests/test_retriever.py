"""Tests de régression du retrieval (src/rag/retriever.py + src/rag/embedding.py).

Couvre les trois améliorations introduites :
  * préfixes E5 « query: » / « passage: » (embedding.py) ;
  * filtre par domaine (where Chroma) + fallback quand 0 résultat ;
  * re-score hybride BM25 (ordonne par pertinence lexicale + vectorielle).

On mocke Chroma pour ne dépendre ni du modèle ni de la base.
"""
from __future__ import annotations

import pytest

from src.rag import embedding, retriever


# --- Préfixes E5 -----------------------------------------------------------

def test_e5_passage_prefix(monkeypatch):
    captured: dict[str, list[str]] = {}

    def fake_super_call(self, inp):  # noqa: ANN001
        captured["inputs"] = list(inp)
        return [[0.0]] * len(inp)

    monkeypatch.setattr(
        "chromadb.utils.embedding_functions.SentenceTransformerEmbeddingFunction.__call__",
        fake_super_call,
    )
    ef = embedding.E5EmbeddingFunction.__new__(embedding.E5EmbeddingFunction)
    ef(["congé payé"])
    assert captured["inputs"] == ["passage: congé payé"]


def test_e5_query_prefix(monkeypatch):
    captured: dict[str, list[str]] = {}

    def fake_super_call(self, inp):  # noqa: ANN001
        captured["inputs"] = list(inp)
        return [[0.0]] * len(inp)

    monkeypatch.setattr(
        "chromadb.utils.embedding_functions.SentenceTransformerEmbeddingFunction.__call__",
        fake_super_call,
    )
    ef = embedding.E5EmbeddingFunction.__new__(embedding.E5EmbeddingFunction)
    embedding.embed_query_text(ef, "congé payé")
    assert captured["inputs"] == ["query: congé payé"]


def test_make_embedding_function_non_e5_is_plain(monkeypatch):
    # Un modèle non-E5 ne doit pas être enveloppé dans le wrapper à préfixes.
    monkeypatch.setattr(
        "chromadb.utils.embedding_functions.SentenceTransformerEmbeddingFunction.__init__",
        lambda self, **kw: None,
    )
    ef = embedding.make_embedding_function("all-MiniLM-L6-v2")
    assert not isinstance(ef, embedding.E5EmbeddingFunction)


# --- Filtre par domaine + fallback ----------------------------------------

class _FakeCollection:
    """Collection Chroma factice : renvoie des lignes selon le filtre `where`."""

    def __init__(self, by_domaine: dict[str | None, list[dict]]):
        self.by_domaine = by_domaine
        self.calls: list[dict | None] = []

    def query(self, *, query_embeddings, n_results, where=None):  # noqa: ANN001
        self.calls.append(where)
        dom = where.get("domaine") if where else None
        rows = self.by_domaine.get(dom, self.by_domaine.get(None, []))
        ids = [r["id"] for r in rows][:n_results]
        docs = [r["text"] for r in rows][:n_results]
        metas = [r["meta"] for r in rows][:n_results]
        dists = [r.get("dist", 0.1) for r in rows][:n_results]
        return {"ids": [ids], "documents": [docs], "metadatas": [metas], "distances": [dists]}


def _row(i, dom, text, dist=0.1):
    return {"id": f"id{i}", "text": text, "meta": {"domaine": dom, "numero_article": str(i)}, "dist": dist}


def _wire(monkeypatch, fake_col, known=("travail", "sante")):
    monkeypatch.setattr(retriever, "_get_collection", lambda: fake_col)
    monkeypatch.setattr(retriever, "_ef", object())
    monkeypatch.setattr(retriever, "embed_query_text", lambda ef, q: [0.0, 0.0])
    monkeypatch.setattr(retriever, "_known_domaines", lambda: set(known))
    # variantes = juste la question (pas de boost) pour des assertions stables
    monkeypatch.setattr("src.agent.prompts.rag_search_query_variants", lambda q, d: [q])


def test_domaine_filter_known_passes_where(monkeypatch):
    col = _FakeCollection({"travail": [_row(1, "travail", "durée du travail")]})
    _wire(monkeypatch, col)
    retriever.search_expanded("durée", domaine="travail")
    assert {"domaine": "travail"} in col.calls


def test_domaine_filter_unknown_is_not_applied(monkeypatch):
    col = _FakeCollection({None: [_row(1, "travail", "texte")]})
    _wire(monkeypatch, col)
    retriever.search_expanded("question", domaine="penal")  # penal non indexé
    assert col.calls == [None]


def test_domaine_filter_general_is_not_applied(monkeypatch):
    col = _FakeCollection({None: [_row(1, "travail", "texte")]})
    _wire(monkeypatch, col)
    retriever.search_expanded("question", domaine="general")
    assert col.calls == [None]


def test_domaine_filter_fallback_when_empty(monkeypatch):
    # Le domaine est connu mais ne ramène rien -> on relance sans filtre.
    col = _FakeCollection({"sante": [], None: [_row(9, "travail", "repli")]})
    _wire(monkeypatch, col)
    rows = retriever.search_expanded("question", domaine="sante")
    assert {"domaine": "sante"} in col.calls
    assert None in col.calls  # fallback déclenché
    assert rows and rows[0]["id"] == "id9"


# --- BM25 re-score ---------------------------------------------------------

def test_hybrid_rescore_bm25_orders_by_lexical_match(monkeypatch):
    monkeypatch.setattr(retriever.get_settings(), "use_hybrid_rag", True, raising=False)
    # Trois candidats, même score vectoriel : seul BM25 départage.
    rows = [
        {"id": "a", "text": "dispositions générales sans rapport", "score": 0.9, "metadata": {}},
        {"id": "b", "text": "le torchage du gaz est interdit sauf dérogation torchage", "score": 0.9, "metadata": {}},
        {"id": "c", "text": "autre texte neutre", "score": 0.9, "metadata": {}},
    ]
    out = retriever._hybrid_rescore(rows, "torchage du gaz", k=3)
    assert out[0]["id"] == "b"  # le doc qui contient « torchage gaz » remonte premier


def test_hybrid_rescore_empty():
    assert retriever._hybrid_rescore([], "x", k=5) == []


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(pytest.main([__file__, "-v"]))
