"""Moteur du chatbot : RAG une fois + un appel LLM (pas d'outils, pas de session uploads)."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from src.agent import llm
from src.agent.prompts import (
    build_system_prompt,
    build_user_message,
    question_seeks_citations,
    strip_markdown_heuristic,
    strip_meta_rag_paragraphs,
)
from src.rag import retriever


# Capture les marqueurs [Article 12, Code …] / [Article 12 bis, …] dans la
# réponse LLM pour savoir quels extraits ont réellement été cités.
_ARTICLE_CITATION_RE = re.compile(
    r"\[\s*article\s+([0-9]+(?:\s*(?:bis|ter|quater))?)\s*[,;:]?",
    re.IGNORECASE,
)


def _cited_article_numbers(answer_text: str) -> set[str]:
    """Renvoie l'ensemble des numéros d'articles que le LLM a explicitement cités."""
    out: set[str] = set()
    for m in _ARTICLE_CITATION_RE.finditer(answer_text or ""):
        raw = (m.group(1) or "").strip().lower()
        if not raw:
            continue
        # On normalise « 12 bis » → « 12bis » pour matcher les métadonnées.
        out.add(re.sub(r"\s+", "", raw))
    return out


def _filter_sources_to_cited(
    sources: list[dict[str, Any]], cited: set[str]
) -> list[dict[str, Any]]:
    """Garde uniquement les sources dont le numero_article apparaît dans la réponse.

    Si la réponse ne cite explicitement aucun article (cited est vide), on
    renvoie une liste vide : pas de sources affichées sous une réponse qui
    n'en a pas utilisé. Évite d'afficher 12 articles du Code du travail
    sous une réponse sur le droit fiscal qui n'a cité aucun d'entre eux.
    """
    if not cited:
        return []
    kept: list[dict[str, Any]] = []
    for s in sources:
        meta = s.get("metadata") if isinstance(s.get("metadata"), dict) else {}
        num_raw = meta.get("numero_article") if meta else None
        if num_raw is None:
            continue
        normalized = re.sub(r"\s+", "", str(num_raw).strip().lower())
        if normalized and normalized in cited:
            kept.append(s)
    return kept


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
            "— Adopte un ton neutre, sobre et accessible. Ne mentionne pas la base documentaire, l'index, le moteur RAG, le corpus, les passages consultés, ni l'absence de passage trouvé. L'utilisateur n'a pas besoin de cette information technique. Réponds simplement à sa question."
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
    *,
    profile: str | None = None,
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

    system_prompt = build_system_prompt(profile)
    msg = llm.create_text_only(system=system_prompt, messages=messages)
    text = strip_markdown_heuristic(llm.extract_text_blocks(msg.content))
    text = strip_meta_rag_paragraphs(text)

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

    # On n'affiche que les sources que le LLM a effectivement citées. Si la
    # réponse n'a cité aucun article (cas type : question hors droit du travail
    # alors que la base ne contient que ce code), on retourne une liste vide
    # — pas de « Sources citées » trompeuses sous la réponse.
    cited = _cited_article_numbers(text)
    sources = _filter_sources_to_cited(sources, cited)
    return ChatAnswer(text=text, sources=sources)
