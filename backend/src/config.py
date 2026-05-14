"""Configuration (variables d'environnement)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    anthropic_model_fallback: str = "claude-3-5-haiku-20241022"

    chroma_path: str = "./data/chroma"
    chroma_collection: str = "droit_gabonais"
    chroma_uploads_collection: str = "uploads_session"
    chroma_embedding_model: str = "intfloat/multilingual-e5-small"
    max_upload_pdf_bytes: int = 10 * 1024 * 1024

    use_hybrid_rag: bool = False
    use_rerank: bool = False

    redis_url: str | None = None

    frontend_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    session_ttl_seconds: int = 30 * 60
    session_max_messages: int = 30
    max_agent_iterations: int = 5
    rag_top_k: int = 8

    # CDC : max_tokens 1024 pour les tours avec outils ; réponse finale sans outils peut être plus longue
    anthropic_max_tokens_with_tools: int = 1024
    anthropic_max_tokens_text: int = 2048

    rate_limit_chat_per_minute: int = 20
    rate_limit_window_seconds: int = 60

    rag_structured_citations: bool = False

    # Mode CDC complet (multi-tours + outils) : plus lent ; désactivé par défaut en prod.
    use_full_agent_chat: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
