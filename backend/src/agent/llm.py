"""Client Anthropic avec repli modèle."""
from __future__ import annotations

import logging
from typing import Any, Iterator

import anthropic

from src.config import get_settings

logger = logging.getLogger(__name__)


def get_client() -> anthropic.Anthropic:
    s = get_settings()
    if not s.anthropic_api_key:
        raise RuntimeError("ANTHROPIC_API_KEY manquant")
    return anthropic.Anthropic(api_key=s.anthropic_api_key)


def create_with_tools(
    *,
    system: str,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]],
    max_tokens: int | None = None,
) -> anthropic.types.Message:
    s = get_settings()
    mt = max_tokens if max_tokens is not None else s.anthropic_max_tokens_with_tools
    client = get_client()
    kwargs = dict(
        model=s.anthropic_model,
        max_tokens=mt,
        temperature=0.2,
        system=system,
        messages=messages,
        tools=tools,
    )
    try:
        return client.messages.create(**kwargs)  # type: ignore[arg-type]
    except Exception as e:
        logger.warning("primary model failed: %s, fallback", e)
        return client.messages.create(
            model=s.anthropic_model_fallback,
            max_tokens=mt,
            temperature=0.2,
            system=system,
            messages=messages,
            tools=tools,
        )


def create_text_only(*, system: str, messages: list[dict[str, Any]]) -> anthropic.types.Message:
    """Dernier tour sans outils (repli modèle identique à create_with_tools)."""
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
        logger.warning("primary model failed (text-only): %s, fallback", e)
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


def stream_create_with_tools(
    *,
    system: str,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]],
    max_tokens: int | None = None,
    holder: dict[str, Any],
) -> Iterator[str]:
    """Itère les deltas texte du tour courant ; place le `Message` final dans `holder[\"msg\"]`."""
    s = get_settings()
    mt = max_tokens if max_tokens is not None else s.anthropic_max_tokens_with_tools
    client = get_client()
    kwargs: dict[str, Any] = dict(
        model=s.anthropic_model,
        max_tokens=mt,
        temperature=0.2,
        system=system,
        messages=messages,
        tools=tools,
    )
    try:
        with client.messages.stream(**kwargs) as stream:
            yield from stream.text_stream
            holder["msg"] = stream.get_final_message()
    except Exception as e:
        logger.warning("primary stream failed: %s, fallback", e)
        fb = {**kwargs, "model": s.anthropic_model_fallback}
        with client.messages.stream(**fb) as stream:
            yield from stream.text_stream
            holder["msg"] = stream.get_final_message()


def stream_text_only(
    *,
    system: str,
    messages: list[dict[str, Any]],
    holder: dict[str, Any] | None = None,
) -> Iterator[str]:
    """Dernier tour sans outils, deltas texte réels."""
    s = get_settings()
    mt = s.anthropic_max_tokens_text
    client = get_client()
    kwargs: dict[str, Any] = dict(
        model=s.anthropic_model,
        max_tokens=mt,
        temperature=0.2,
        system=system,
        messages=messages,
    )
    try:
        with client.messages.stream(**kwargs) as stream:
            yield from stream.text_stream
            if holder is not None:
                holder["msg"] = stream.get_final_message()
    except Exception as e:
        logger.warning("primary text stream failed: %s, fallback", e)
        fb = {**kwargs, "model": s.anthropic_model_fallback}
        with client.messages.stream(**fb) as stream:
            yield from stream.text_stream
            if holder is not None:
                holder["msg"] = stream.get_final_message()
