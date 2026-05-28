"""Configuration (variables d'environnement)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"
    anthropic_model_fallback: str = "claude-haiku-4-5-20251001"

    chroma_path: str = "./data/chroma"
    chroma_collection: str = "droit_gabonais"
    chroma_embedding_model: str = "intfloat/multilingual-e5-base"

    use_hybrid_rag: bool = True
    use_rerank: bool = True
    use_cross_encoder: bool = True    # reranker cross-encoder après hybride (étape 4)
    use_query_rewriter: bool = True   # reformulation Haiku + RRF (étape 5)

    redis_url: str | None = None

    frontend_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    session_ttl_seconds: int = 30 * 60
    session_max_messages: int = 30
    rag_top_k: int = 12

    anthropic_max_tokens_text: int = 2048

    rate_limit_chat_per_minute: int = 20
    rate_limit_window_seconds: int = 60

    rag_structured_citations: bool = False

    # Seuil de pertinence : un chunk dont le score hybride (vectoriel+lexical)
    # tombe en dessous est considéré comme hors-sujet et n'est ni envoyé au LLM
    # ni affiché à l'utilisateur dans la liste des sources citées.
    #
    # NB (E5) : avec les embeddings multilingual-e5-* préfixés, la similarité
    # cosinus est très compressée vers le haut (~0.92-0.95 pour TOUT extrait,
    # pertinent ou non). Un seuil absolu ne sépare donc pas le hors-sujet du
    # pertinent — la suppression du bruit cross-domaine repose plutôt sur :
    #   1. le filtre par domaine (where Chroma) quand un domaine indexé est fourni ;
    #   2. le system prompt (refus hors-sujet) + le filtrage des sources réellement
    #      citées par le LLM côté chat_engine.
    # Ce seuil reste un garde-fou bas ; ne pas le monter sans recalibrer sur
    # scripts/eval_retrieval.py (sinon on coupe des résultats pertinents).
    rag_min_score: float = 0.30

    # Allowlist domaines pour les scripts d'ingestion (fetch_official_sources, ingest_pdfs).
    corpus_sources_yaml: str = "./corpus/sources.yaml"

    # Préchauffage Chroma au boot : true dès ~1 Go de RAM ; false sur petites instances (<1 Go).
    warm_rag_on_startup: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
