"""Agent juridique : boucle outils + collecte des sources."""
from __future__ import annotations

import logging
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any

from src.agent import llm
from src.agent.prompts import SYSTEM_PROMPT, strip_markdown_heuristic
from src.agent.tools import ToolContext, anthropic_tool_definitions, execute_tool
from src.config import get_settings
from src.rag import retriever

logger = logging.getLogger(__name__)


@dataclass
class AgentAnswer:
    text: str
    sources: list[dict[str, Any]]
    tools_used: list[str]


class LegalAgent:
    def _build_messages(
        self,
        question: str,
        domaine: str | None,
        history: list[dict[str, str]],
    ) -> tuple[list[dict[str, Any]], str]:
        from src.agent.prompts import build_user_message

        user_final = build_user_message(question, domaine)
        messages: list[dict[str, Any]] = []
        for h in history:
            role = h.get("role")
            content = (h.get("content") or "").strip()
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})
        if not history or history[-1].get("role") != "user":
            messages.append({"role": "user", "content": user_final})
        return messages, user_final

    def answer(
        self,
        question: str,
        domaine: str | None,
        history: list[dict[str, str]],
        session_id: str | None = None,
        include_uploads: bool = False,
    ) -> AgentAnswer:
        messages, _user_final = self._build_messages(question, domaine, history)
        ctx = ToolContext(session_id=session_id, include_uploads=include_uploads)
        s = get_settings()
        tools = anthropic_tool_definitions()

        max_it = s.max_agent_iterations
        for _iteration in range(max_it):
            msg = llm.create_with_tools(system=SYSTEM_PROMPT, messages=messages, tools=tools)
            stop = msg.stop_reason

            if stop == "end_turn" or stop is None:
                text = llm.extract_text_blocks(msg.content)
                if text:
                    return self._finalize(text, ctx)

            if stop == "tool_use":
                tool_results: list[dict[str, Any]] = []
                for block in msg.content:
                    btype = getattr(block, "type", None)
                    if btype == "tool_use":
                        name = getattr(block, "name", "")
                        tool_input = getattr(block, "input", {}) or {}
                        tid = getattr(block, "id", "")
                        out = execute_tool(name, tool_input if isinstance(tool_input, dict) else {}, ctx)
                        tool_results.append({"type": "tool_result", "tool_use_id": tid, "content": out})
                messages.append({"role": "assistant", "content": msg.content})
                if tool_results:
                    messages.append({"role": "user", "content": tool_results})
                else:
                    logger.warning("stop_reason=tool_use but no tool_use blocks; breaking agent loop")
                    break
                continue

            text = llm.extract_text_blocks(msg.content)
            if text:
                return self._finalize(text, ctx)
            break

        messages.append(
            {
                "role": "user",
                "content": "Réponds de façon complète en texte brut, sans appeler d'outil, en t'appuyant sur ce qui précède.",
            }
        )
        final = llm.create_text_only(system=SYSTEM_PROMPT, messages=messages)
        text = llm.extract_text_blocks(final.content)
        return self._finalize(text or "Impossible de produire une réponse.", ctx)

    def stream_final_answer(
        self,
        question: str,
        domaine: str | None,
        history: list[dict[str, str]],
        session_id: str | None,
        include_uploads: bool,
        out: dict[str, Any],
    ) -> Iterator[str]:
        """SSE : émet des deltas texte réels ; remplit `out` avec clés answer, sources, tools_used."""
        messages, _user_final = self._build_messages(question, domaine, history)
        ctx = ToolContext(session_id=session_id, include_uploads=include_uploads)
        s = get_settings()
        tools = anthropic_tool_definitions()
        max_it = s.max_agent_iterations

        for _iteration in range(max_it):
            holder: dict[str, Any] = {}
            buf: list[str] = []
            for t in llm.stream_create_with_tools(
                system=SYSTEM_PROMPT,
                messages=messages,
                tools=tools,
                holder=holder,
            ):
                buf.append(t)
            msg = holder["msg"]
            stop = msg.stop_reason

            if stop == "end_turn" or stop is None:
                text = llm.extract_text_blocks(msg.content)
                if text:
                    for p in buf:
                        yield p
                    ans = self._finalize(text, ctx)
                    out["answer"] = ans
                    return

            if stop == "tool_use":
                tool_results: list[dict[str, Any]] = []
                for block in msg.content:
                    btype = getattr(block, "type", None)
                    if btype == "tool_use":
                        name = getattr(block, "name", "")
                        tool_input = getattr(block, "input", {}) or {}
                        tid = getattr(block, "id", "")
                        out_t = execute_tool(name, tool_input if isinstance(tool_input, dict) else {}, ctx)
                        tool_results.append({"type": "tool_result", "tool_use_id": tid, "content": out_t})
                messages.append({"role": "assistant", "content": msg.content})
                if tool_results:
                    messages.append({"role": "user", "content": tool_results})
                else:
                    logger.warning("stop_reason=tool_use but no tool_use blocks; breaking stream loop")
                    break
                continue

            text = llm.extract_text_blocks(msg.content)
            if text:
                for p in buf:
                    yield p
                ans = self._finalize(text, ctx)
                out["answer"] = ans
                return
            break

        messages.append(
            {
                "role": "user",
                "content": "Réponds de façon complète en texte brut, sans appeler d'outil, en t'appuyant sur ce qui précède.",
            }
        )
        h_final: dict[str, Any] = {}
        for t in llm.stream_text_only(system=SYSTEM_PROMPT, messages=messages, holder=h_final):
            yield t
        fn_msg = h_final.get("msg")
        text = llm.extract_text_blocks(fn_msg.content) if fn_msg else ""
        ans = self._finalize(text or "Impossible de produire une réponse.", ctx)
        out["answer"] = ans

    def _finalize(self, text: str, ctx: ToolContext) -> AgentAnswer:
        text = strip_markdown_heuristic(text)
        if not ctx.sources:
            fb = retriever.search(
                text[:500] if text else "",
                session_id=ctx.session_id,
                include_uploads=ctx.include_uploads,
            )
            for r in fb:
                ctx.sources.append(
                    {
                        "citation": r.get("citation", ""),
                        "text": (r.get("text") or "")[:4000],
                        "score": float(r.get("score", 0.4)),
                        "badge": "fallback",
                    }
                )
        return AgentAnswer(text=text, sources=ctx.sources, tools_used=ctx.tools_used)
