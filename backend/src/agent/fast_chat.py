"""Chemin chat rapide : RAG une fois + un appel LLM sans boucle outils (défaut prod)."""
from __future__ import annotations

from typing import Any

from src.agent.agent import AgentAnswer
from src.agent import llm
from src.agent.prompts import (
    SYSTEM_PROMPT_FAST,
    build_user_message,
    strip_markdown_heuristic,
)
from src.rag import retriever


def _format_rag_block(rows: list[dict[str, Any]], max_snippets: int = 8, max_chars: int = 900) -> str:
    if not rows:
        return (
            "Contexte indexé LexGabon : aucun passage n'a été retourné par la recherche pour cette requête "
            "(index vide en environnement de test, corpus limité, ou thème encore peu couvert — une seule de ces raisons peut suffire).\n\n"
            "Instructions pour ta réponse :\n"
            "— Réponds d'abord de façon structurée en t'appuyant sur tes connaissances du droit applicable au Gabon et des cadres régionaux pertinents (sans inventer d'articles ni d'actes précis).\n"
            "— Ensuite, un court paragraphe introduit par « Sources indexées » doit expliquer pourquoi l'index LexGabon n'a fourni aucun extrait à citer.\n"
            "— Ne commence pas ta réponse uniquement par l'absence de documents : la synthèse juridique doit venir en premier."
        )
    parts: list[str] = []
    for i, r in enumerate(rows[:max_snippets], start=1):
        cit = str(r.get("citation") or r.get("id") or f"doc{i}")
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        extra = retriever.rag_metadata_subheader(meta)
        body = (r.get("text") or "").strip().replace("\r\n", "\n")
        if len(body) > max_chars:
            body = body[: max_chars - 1] + "…"
        head = f"[{i}] {cit}"
        if extra:
            head = f"{head}\n{extra}"
        parts.append(f"{head}\n{body}")
    return (
        "Contexte indexé LexGabon (extraits à exploiter après ta synthèse de connaissances ; "
        "chaque emprunt doit être cité au format exact [Source : …] (ou [Source: …]), en reprenant au minimum la ligne de citation de l'extrait "
        "et, si la ligne « Article / disposition : » est présente, le numéro d'article doit apparaître tel quel dans [Source : …]) :\n\n"
        + "\n\n---\n\n".join(parts)
    )


def _anthropic_messages_from_history(hist: list[dict[str, str]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for m in hist:
        role = m.get("role")
        content = (m.get("content") or "").strip()
        if role not in ("user", "assistant") or not content:
            continue
        out.append({"role": role, "content": content})
    return out


def run_fast_chat(
    question: str,
    domaine: str | None,
    hist: list[dict[str, str]],
    *,
    session_id: str | None,
    include_uploads: bool,
) -> AgentAnswer:
    """Récupère top-k Chroma puis un seul `create_text_only` (pas d'outils)."""
    rows = retriever.search(
        question.strip(),
        session_id=session_id,
        include_uploads=include_uploads,
        domaine=domaine,
    )
    rag_block = _format_rag_block(rows)

    messages_anthropic = _anthropic_messages_from_history(hist)
    if not messages_anthropic:
        messages_anthropic = [{"role": "user", "content": build_user_message(question, domaine)}]

    if messages_anthropic[-1].get("role") != "user":
        messages_anthropic.append({"role": "user", "content": build_user_message(question, domaine)})

    last = str(messages_anthropic[-1].get("content") or "")
    messages_anthropic[-1] = {"role": "user", "content": f"{last}\n\n---\n\n{rag_block}"}

    msg = llm.create_text_only(system=SYSTEM_PROMPT_FAST, messages=messages_anthropic)
    text = strip_markdown_heuristic(llm.extract_text_blocks(msg.content))

    sources: list[dict[str, Any]] = []
    for r in rows[:20]:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        sources.append(
            {
                "citation": str(r.get("citation", "")),
                "text": str(r.get("text", ""))[:4000],
                "score": float(r.get("score", 0.4)),
                "badge": "doc",
                "id": r.get("id"),
                "metadata": meta,
            }
        )

    return AgentAnswer(text=text, sources=sources, tools_used=["fast_rag"])


def stream_fast_tokens(
    question: str,
    domaine: str | None,
    hist: list[dict[str, str]],
    *,
    session_id: str | None,
    include_uploads: bool,
    holder: dict[str, Any],
):
    """Itère les deltas texte après RAG synchrone (holder reçoit l'AgentAnswer final)."""
    rows = retriever.search(
        question.strip(),
        session_id=session_id,
        include_uploads=include_uploads,
        domaine=domaine,
    )
    rag_block = _format_rag_block(rows)
    messages_anthropic = _anthropic_messages_from_history(hist)
    if not messages_anthropic:
        messages_anthropic = [{"role": "user", "content": build_user_message(question, domaine)}]
    if messages_anthropic[-1].get("role") != "user":
        messages_anthropic.append({"role": "user", "content": build_user_message(question, domaine)})
    last = str(messages_anthropic[-1].get("content") or "")
    messages_anthropic[-1] = {"role": "user", "content": f"{last}\n\n---\n\n{rag_block}"}

    text_parts: list[str] = []
    stream_holder: dict[str, Any] = {}
    for delta in llm.stream_text_only(system=SYSTEM_PROMPT_FAST, messages=messages_anthropic, holder=stream_holder):
        text_parts.append(delta)
        yield delta

    raw = "".join(text_parts)
    text = strip_markdown_heuristic(raw)
    sources: list[dict[str, Any]] = []
    for r in rows[:20]:
        meta = r.get("metadata") if isinstance(r.get("metadata"), dict) else {}
        sources.append(
            {
                "citation": str(r.get("citation", "")),
                "text": str(r.get("text", ""))[:4000],
                "score": float(r.get("score", 0.4)),
                "badge": "doc",
                "id": r.get("id"),
                "metadata": meta,
            }
        )
    holder["answer"] = AgentAnswer(text=text, sources=sources, tools_used=["fast_rag"])
