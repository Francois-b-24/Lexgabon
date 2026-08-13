"""Retriever ChromaDB + embeddings multilingues (hybride vectoriel + recouvrement lexical)."""
from __future__ import annotations

import logging
import re
import sys
from pathlib import Path
from typing import Any

import chromadb

from src.config import get_settings
from src.rag.embedding import embed_query_text, make_embedding_function

# Logger stdlib conservé pour les modules qui l'importent directement.
logger = logging.getLogger(__name__)

# Logger loguru rotatif — activé uniquement quand loguru est disponible
# (évite une dépendance dure en test unitaire sans loguru installé).
try:
    from loguru import logger as _loguru

    _LOG_DIR = Path(__file__).resolve().parents[3] / "logs"
    _LOG_DIR.mkdir(exist_ok=True)
    _loguru.add(
        _LOG_DIR / "rag.log",
        rotation="10 MB",
        retention="14 days",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
        enqueue=True,  # thread-safe pour uvicorn multi-worker
        diagnose=False,
    )
    _rag_log = _loguru
except ImportError:  # pragma: no cover — loguru absent en test léger
    _rag_log = None  # type: ignore[assignment]


def _log_rag_request(
    query: str,
    rows: list[dict[str, Any]],
    domaine: str | None,
) -> None:
    """Dump structuré INFO par requête : query, top-k scores, articles."""
    if _rag_log is None:
        return
    top_k_info = [
        {
            "id": r.get("id"),
            "score": round(float(r.get("score", 0)), 4),
            "num": (r.get("metadata") or {}).get("numero_article"),
            "code": (r.get("metadata") or {}).get("code"),
        }
        for r in rows
    ]
    articles = [
        t["num"] for t in top_k_info if t["num"]
    ]
    _rag_log.info(
        "RAG | query={query!r} domaine={domaine} n={n} articles={articles} top_k={top_k}",
        query=query[:200],
        domaine=domaine or "—",
        n=len(rows),
        articles=articles[:20],
        top_k=top_k_info,
    )


def _meta_numero_article(meta: dict[str, Any]) -> str | None:
    raw = meta.get("numero_article")
    if raw is None:
        return None
    s = str(raw).strip()
    if not s or s == "—":
        return None
    return s


def enrich_citation_line(meta: dict[str, Any] | None, base: str) -> str:
    """Ligne de citation affichée au modèle : inclut le numéro d'article si présent en métadonnées."""
    m = meta or {}
    b = (base or "").strip() or "Document indexé"
    n = _meta_numero_article(m)
    if not n:
        return b
    low = b.lower()
    nlow = n.lower()
    if nlow in low or f"article {nlow}" in low or f"art. {nlow}" in low or f"art {nlow}" in low:
        return b
    return f"{b} — article {n}"


def rag_metadata_subheader(meta: dict[str, Any]) -> str:
    """Sous-ligne d'en-tête (référence, article, URL) pour le contexte LLM."""
    parts: list[str] = []
    ref = meta.get("reference")
    if isinstance(ref, str) and ref.strip():
        parts.append(f"Référence : {ref.strip()}")
    num = _meta_numero_article(meta)
    if num:
        parts.append(f"Article / disposition : {num}")
    url = meta.get("url")
    if isinstance(url, str) and url.strip():
        parts.append(f"URL : {url.strip()}")
    return " · ".join(parts)


_ef: Any = None
_collection: Any = None


def _get_collection():
    global _ef, _collection
    if _collection is not None:
        return _collection
    s = get_settings()
    _ef = make_embedding_function(s.chroma_embedding_model)
    client = chromadb.PersistentClient(path=s.chroma_path)
    _collection = client.get_or_create_collection(
        name=s.chroma_collection,
        embedding_function=_ef,
        metadata={"hnsw:space": "cosine"},
    )
    return _collection


_known_domaines_cache: set[str] | None = None


def _known_domaines() -> set[str]:
    """Ensemble des valeurs `domaine` réellement présentes en métadonnée (mis en cache).

    Sert à n'activer le filtre par domaine que pour les domaines effectivement
    indexés. Échantillonne les métadonnées de la collection une seule fois.
    """
    global _known_domaines_cache
    if _known_domaines_cache is not None:
        return _known_domaines_cache
    found: set[str] = set()
    try:
        col = _get_collection()
        got = col.get(include=["metadatas"], limit=100_000)
        for m in got.get("metadatas") or []:
            d = (m or {}).get("domaine")
            if isinstance(d, str) and d.strip():
                found.add(d.strip())
    except Exception as e:  # pragma: no cover - lecture best-effort
        logger.warning("could not enumerate domaines: %s", e)
    _known_domaines_cache = found
    return found


_WORD_RE = re.compile(r"[a-zàâäéèêëïîôùûüçœæ0-9]+")


def _tokens_fr(text: str) -> list[str]:
    """Tokens français (liste, avec répétitions — requis par BM25)."""
    return _WORD_RE.findall((text or "").lower())


def _tokenize_fr(text: str) -> set[str]:
    return set(_tokens_fr(text))


def _overlap_score(doc_text: str, query: str) -> float:
    qt = _tokenize_fr(query)
    if not qt:
        return 0.0
    tt = _tokenize_fr(doc_text)
    inter = len(qt & tt)
    return inter / max(len(qt), 1)


def _minmax(values: list[float]) -> list[float]:
    """Normalisation min-max sur [0,1] ; renvoie 0.5 partout si plat ou vide."""
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return [0.5 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]


def _hybrid_rescore(rows: list[dict[str, Any]], query: str, k: int) -> list[dict[str, Any]]:
    """Re-score hybride : composante vectorielle + BM25 lexical sur le pool de candidats.

    Pourquoi BM25 plutôt que le Jaccard d'avant : les scores cosinus E5 sont très
    compressés (~0.92-0.95 pour tout extrait), donc peu discriminants. BM25, calculé
    sur le pool fetché, pondère par IDF (termes rares = numéro d'article, terme
    juridique précis) et fait l'essentiel du tri fin. On normalise min-max les deux
    composantes *sur le pool* pour que chacune pèse réellement, puis on combine
    avec la pondération éprouvée 0.62 / 0.38.
    """
    if not rows:
        return rows
    try:
        from rank_bm25 import BM25Okapi
    except ImportError:  # pragma: no cover - fallback si la dépendance manque
        logger.warning("rank-bm25 absent, repli sur le recouvrement lexical simple")
        scored = sorted(
            rows,
            key=lambda r: 0.62 * float(r.get("score", 0.5)) + 0.38 * _overlap_score(r.get("text") or "", query),
            reverse=True,
        )
        return scored[:k]

    corpus_tokens = [_tokens_fr(r.get("text") or "") for r in rows]
    query_tokens = _tokens_fr(query)
    if any(corpus_tokens) and query_tokens:
        bm25 = BM25Okapi([t or ["∅"] for t in corpus_tokens])
        bm25_raw = list(bm25.get_scores(query_tokens))
    else:
        bm25_raw = [0.0 for _ in rows]

    vec_norm = _minmax([float(r.get("score", 0.5)) for r in rows])
    bm25_norm = _minmax(bm25_raw)

    scored: list[tuple[float, dict[str, Any]]] = []
    for r, v, b in zip(rows, vec_norm, bm25_norm):
        combined = 0.62 * v + 0.38 * b
        scored.append((combined, r))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [r for _, r in scored[:k]]


def _maybe_rerank_overlap(rows: list[dict[str, Any]], query: str, k: int) -> list[dict[str, Any]]:
    """Tri lexical de secours, UNIQUEMENT quand le re-score hybride est désactivé.

    Quand use_hybrid_rag est actif, l'ordre vient déjà de _hybrid_rescore (vectoriel
    + BM25), nettement plus fin que le simple recouvrement de tokens : on ne le
    réécrase donc pas. Ce rerank ne sert plus que de repli quand le hybride est off.
    """
    s = get_settings()
    if not s.use_rerank or s.use_hybrid_rag or not rows:
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
        raw_cit = (meta or {}).get("citation") or (meta or {}).get("titre") or str(doc_id)
        citation = enrich_citation_line(meta or {}, str(raw_cit))
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


def search_main(
    query: str,
    k: int | None = None,
    *,
    where: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Recherche dans la collection principale (hybride : fetch élargi + re-score).

    `where` est un filtre de métadonnée Chroma (ex. {"domaine": "travail"}). S'il
    ne renvoie aucun extrait, l'appelant (search_expanded) relance sans filtre.

    Fetch strategy :
      - cross-encoder actif  : fetch 24 → hybride top 12 (le reranker réduit à 6)
      - hybride seul          : fetch k*2 → hybride top k
      - vectoriel pur         : fetch k
    """
    s = get_settings()
    k = k or s.rag_top_k
    col = _get_collection()
    if s.use_hybrid_rag and s.use_cross_encoder:
        # Le pool remis au cross-encoder est le vrai levier de rappel : tout
        # candidat coupé ici ne sera jamais vu par le reranker, qui est
        # pourtant le composant le plus précis du pipeline. D'où deux réglages
        # explicites plutôt que des constantes enfouies.
        n_fetch = max(int(getattr(s, "rag_fetch_pool", 24)), k * 2)
        k_hybrid = max(int(getattr(s, "rag_rerank_pool", 12)), k)
    elif s.use_hybrid_rag:
        n_fetch = k * 2
        k_hybrid = k
    else:
        n_fetch = k
        k_hybrid = k
    query_kwargs: dict[str, Any] = {"n_results": max(1, n_fetch)}
    if where:
        query_kwargs["where"] = where
    try:
        # Embedding de la requête avec le préfixe « query: » (E5) calculé côté
        # retriever, puis passé en query_embeddings — Chroma n'applique alors PAS
        # le préfixe « passage: » de l'EF d'ingestion à la requête.
        q_vec = embed_query_text(_ef, query)
        res = col.query(query_embeddings=[q_vec], **query_kwargs)
    except Exception as e:
        logger.warning("chroma query failed: %s", e)
        return []
    rows = _rows_from_chroma_result(res, n_fetch)
    if s.use_hybrid_rag:
        rows = _hybrid_rescore(rows, query, k_hybrid)
    else:
        rows = rows[:k_hybrid]
    return _maybe_rerank_overlap(rows, query, k_hybrid)


def _domaine_filter(domaine: str | None) -> dict[str, Any] | None:
    """Filtre Chroma {"domaine": ...} si le domaine est connu du corpus, sinon None.

    On ne filtre pas sur « general » (recherche transversale) ni sur un domaine
    absent de l'index (le filtre renverrait toujours 0 et forcerait un fallback
    inutile). Les valeurs proviennent des métadonnées peuplées à l'ingestion
    (manifest.yaml → champ `domaine`).

    Le refus des domaines non indexés n'est PAS traité ici : il appartient au
    gate lexical (`src/rag/gate.py`), qui décide avant la recherche et sur le
    texte de la question. Le faire ici ne couvrirait que le cas où l'utilisateur
    a renseigné le sélecteur front — soit une minorité des requêtes réelles.
    """
    d = (domaine or "").strip()
    if not d or d == "general":
        return None
    if d not in _known_domaines():
        return None
    return {"domaine": d}


def _rrf_fuse(
    ranked_lists: list[list[dict[str, Any]]],
    k_rrf: int = 60,
) -> dict[str, dict[str, Any]]:
    """Reciprocal Rank Fusion sur plusieurs listes ordonnées.

    Pour chaque document d apparaissant à la position r (1-indexed) dans une
    liste, son score RRF s'incrémente de 1 / (k_rrf + r). Les documents
    absents d'une liste ne contribuent pas. Retourne un dict id→row avec le
    score RRF injecté dans le champ 'score'.
    """
    rrf_scores: dict[str, float] = {}
    rows_by_id: dict[str, dict[str, Any]] = {}
    for ranked in ranked_lists:
        for rank, row in enumerate(ranked, start=1):
            rid = str(row.get("id") or "")
            if not rid:
                continue
            rrf_scores[rid] = rrf_scores.get(rid, 0.0) + 1.0 / (k_rrf + rank)
            if rid not in rows_by_id:
                rows_by_id[rid] = dict(row)
    # Injecte le score RRF comme score de tri
    for rid, score in rrf_scores.items():
        rows_by_id[rid]["score"] = score
    return rows_by_id


def search_expanded(
    query: str,
    k: int | None = None,
    *,
    domaine: str | None = None,
    citation_intent: bool = False,
) -> list[dict[str, Any]]:
    """Requêtes multiples (original + boost + variantes rewriter) fusionnées par RRF.

    Pipeline :
      1. Variantes = [original, boost_domaine] + rewriter (2 reformulations Haiku, LRU 500)
      2. fetch top-k Chroma + hybride BM25 pour chacune → listes ordonnées
      3. Fusion RRF(k=60) sur l'union
      4. Cross-encoder reranker top-6 sur les meilleurs candidats

    Si un domaine connu est indiqué, on filtre d'abord sur ce domaine ; si le
    filtre renvoie 0 résultat, on relance sans filtre.
    """
    from src.agent.prompts import rag_search_query_variants

    s = get_settings()
    base_k = k or s.rag_top_k
    k_eff = min(20, max(base_k, int(base_k * 1.75) + 2)) if citation_intent else base_k
    where = _domaine_filter(domaine)

    # Construit la liste de toutes les variantes de requête
    variants = rag_search_query_variants(query, domaine)
    if s.use_query_rewriter:
        try:
            from src.rag.query_rewriter import rewrite
            rewrites = rewrite(query)
            for rv in rewrites:
                if rv and rv not in variants:
                    variants.append(rv)
        except Exception as e:
            logger.warning("query_rewriter import/call failed: %s", e)

    def _collect_lists(flt: dict[str, Any] | None) -> list[list[dict[str, Any]]]:
        """Retourne une liste de listes ordonnées (une par variante).

        Le domain filter s'applique à toutes les variantes (y compris rewriter)
        pour éviter que les variantes Haiku ramènent des chunks cross-domaine.
        """
        lists: list[list[dict[str, Any]]] = []
        for v in variants:
            rows = search_main(v, k_eff, where=flt)
            if rows:
                lists.append(rows)
        return lists

    ranked_lists = _collect_lists(where)
    if where and not ranked_lists:
        logger.info("rag domaine filter '%s' returned 0 rows, falling back to unfiltered", domaine)
        ranked_lists = _collect_lists(None)

    # Fusion score-max sur toutes les variantes (original + boost + rewriter).
    # Note : RRF testé mais produit une régression avec E5-base car les scores
    # cosinus compressés (~0.93-0.96) rendent les rangs BM25 instables sur un
    # pool élargi. Score-max conserve le signal hybride calibré. RRF serait
    # préférable si les listes venaient de systèmes hétérogènes (BM25 pur +
    # vectoriel pur), ce qui n'est pas le cas ici (toutes passent par _hybrid_rescore).
    by_id: dict[str, dict[str, Any]] = {}
    for ranked in ranked_lists:
        for r in ranked:
            rid = str(r.get("id") or "")
            if not rid:
                continue
            sc = float(r.get("score", 0))
            if rid not in by_id or sc > float(by_id[rid].get("score", 0)):
                by_id[rid] = dict(r)

    merged = sorted(by_id.values(), key=lambda x: float(x.get("score", 0)), reverse=True)
    merged = merged[:k_eff]
    merged = _maybe_rerank_overlap(merged, query, k_eff)

    if s.use_cross_encoder and len(merged) > 1:
        # `top_k_llm = 6` n'est pas un plafond arbitraire : mesuré, élargir la
        # sortie du reranker à 12 fait CHUTER le Recall@5 de 0.429 à 0.292. Le
        # cross-encoder réordonne alors le top-5, et son classement y est moins
        # bon que le score hybride. Ne pas « corriger » sans re-mesurer — voir la
        # note « étape 9 » de evals/history.md.
        from src.rag.reranker import rerank
        top_k_llm = max(6, s.rag_top_k // 2)
        merged = rerank(query, merged, top_k=top_k_llm)

    return merged


def search(
    query: str,
    k: int | None = None,
    *,
    domaine: str | None = None,
    citation_intent: bool = False,
) -> list[dict[str, Any]]:
    """Point d'entrée unique : recherche RAG sur la collection principale.

    Filtre par `rag_min_score` : un chunk dont le score hybride est en
    dessous du seuil est considéré comme hors-sujet et écarté avant tout
    rendu. Si rien ne passe le seuil, on renvoie []. Le LLM répondra alors
    sur ses connaissances générales sans citer d'article hors-sujet.
    """
    rows = search_expanded(query, k, domaine=domaine, citation_intent=citation_intent)
    s = get_settings()
    threshold = float(getattr(s, "rag_min_score", 0.0) or 0.0)
    if threshold <= 0.0 or not rows:
        return rows
    filtered = [r for r in rows if float(r.get("score", 0.0)) >= threshold]
    if not filtered:
        logger.info(
            "rag search dropped all %d rows below score threshold %.2f (top=%.3f)",
            len(rows),
            threshold,
            float(rows[0].get("score", 0.0)) if rows else 0.0,
        )
    _log_rag_request(query, filtered, domaine)
    return filtered


def format_context_for_llm(rows: list[dict[str, Any]], max_chars_per: int = 900) -> str:
    """Sérialise les extraits pour injection dans le prompt utilisateur (avant LLM)."""
    if not rows:
        return ""
    parts: list[str] = []
    for i, r in enumerate(rows, start=1):
        cit = str(r.get("citation") or r.get("id") or f"doc{i}")
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        head = f"[Extrait {i}] {cit}"
        sub = rag_metadata_subheader(meta or {})
        if sub:
            head = f"{head}\n{sub}"
        body = (r.get("text") or "").strip().replace("\r\n", "\n")
        if len(body) > max_chars_per:
            body = body[: max_chars_per - 1] + "…"
        parts.append(f"{head}\n{body}")
    return "\n\n---\n\n".join(parts)
