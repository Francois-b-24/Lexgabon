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
    chroma_embedding_model: str = "intfloat/multilingual-e5-small"

    use_hybrid_rag: bool = True
    use_rerank: bool = True

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
    # ni affiché à l'utilisateur dans la liste des sources citées. Évite que
    # le LLM cite un article du Code du travail pour une question fiscale
    # simplement parce que c'est le seul code intégralement indexé.
    rag_min_score: float = 0.30

    # Allowlist domaines pour les scripts d'ingestion (fetch_official_sources, ingest_pdfs).
    corpus_sources_yaml: str = "./corpus/sources.yaml"

    # Préchauffage Chroma au boot : true dès ~1 Go de RAM ; false sur petites instances (<1 Go).
    warm_rag_on_startup: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
