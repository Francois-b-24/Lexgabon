"""Client Anthropic (texte seul) avec repli modèle."""
from __future__ import annotations

import logging
from typing import Any

import anthropic

from src.config import get_settings

logger = logging.getLogger(__name__)


def get_client() -> anthropic.Anthropic:
    s = get_settings()
    if not s.anthropic_api_key:
        raise RuntimeError("ANTHROPIC_API_KEY manquant")
    return anthropic.Anthropic(api_key=s.anthropic_api_key)


def create_text_only(*, system: str, messages: list[dict[str, Any]]) -> anthropic.types.Message:
    """Un appel modèle, texte uniquement, avec repli si le modèle principal échoue."""
    s = get_settings()
    mt = s.anthropic_max_tokens_text
    client = get_client()
    kwargs = dict(
        model=s.anthropic_model,
        max_tokens=mt,
        temperature=0.2,
        system=system,
        messages=messages,
    )
    try:
        return client.messages.create(**kwargs)  # type: ignore[arg-type]
    except Exception as e:
        logger.warning("primary model failed: %s, fallback %s", e, s.anthropic_model_fallback)
        return client.messages.create(
            model=s.anthropic_model_fallback,
            max_tokens=mt,
            temperature=0.2,
            system=system,
            messages=messages,
        )


def extract_text_blocks(content: list[Any]) -> str:
    parts: list[str] = []
    for block in content:
        btype = getattr(block, "type", None) or (block.get("type") if isinstance(block, dict) else None)
        if btype == "text":
            t = getattr(block, "text", None) or (block.get("text") if isinstance(block, dict) else "")
            if t:
                parts.append(str(t))
    return "\n".join(parts).strip()
