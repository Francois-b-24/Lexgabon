"""Moteur du chatbot : RAG une fois + un appel LLM (pas d'outils, pas de session uploads)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from src.agent import llm
from src.agent.prompts import (
    SYSTEM_PROMPT_FAST,
    build_user_message,
    question_seeks_citations,
    strip_markdown_heuristic,
)
from src.rag import retriever


@dataclass
class ChatAnswer:
    text: str
    sources: list[dict[str, Any]] = field(default_factory=list)


def _format_rag_block(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return (
            "Contexte indexé LexGabon : aucun passage n'a été retourné pour cette requête.\n\n"
            "Instructions :\n"
            "— Si la question relève bien du droit gabonais ou d'une norme régionale applicable (OHADA, CEMAC, COBAC, CIMA), réponds sur le fond à partir de tes connaissances juridiques fiables sans inventer de numéros d'articles ni de dates.\n"
            "— Termine par un court paragraphe « Sources indexées » expliquant que l'index n'a pas fourni de passage à citer pour cette requête."
        )
    body = retriever.format_context_for_llm(rows, max_chars_per=900)
    return (
        "Contexte indexé LexGabon (extraits à exploiter ; chaque emprunt doit être cité au format "
        "[Article N, <Nom du code ou loi>] si l'extrait porte un numéro d'article, sinon [Source : <référence>]) :\n\n"
        + body
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


def run_chat(
    question: str,
    domaine: str | None,
    hist: list[dict[str, str]],
) -> ChatAnswer:
    """Récupère top-k Chroma puis un seul appel LLM (texte uniquement)."""
    cite_intent = question_seeks_citations(question.strip())
    rows = retriever.search(
        question.strip(),
        domaine=domaine,
        citation_intent=cite_intent,
    )
    rag_block = _format_rag_block(rows)

    messages = _anthropic_messages_from_history(hist)
    if not messages or messages[-1].get("role") != "user":
        messages.append({"role": "user", "content": build_user_message(question, domaine)})

    last = str(messages[-1].get("content") or "")
    messages[-1] = {"role": "user", "content": f"{last}\n\n---\n\n{rag_block}"}

    msg = llm.create_text_only(system=SYSTEM_PROMPT_FAST, messages=messages)
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
    return ChatAnswer(text=text, sources=sources)
