"use client";

import { IconArrowUp, IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useLegalAgentSession } from "@/hooks/use-legal-agent-session";
import { useUserProfile } from "@/hooks/use-user-profile";
import { SourceList } from "@/components/chatbot/source-list";
import { LegalNoteRenderer } from "@/components/chatbot/legal-note-renderer";
import { QuestionSuggestions } from "@/components/chatbot/question-suggestions";
import type { ChatSource, StructuredAnswer } from "@/lib/chatbot-types";

type Role = "user" | "assistant";
type ChatMsg = {
  role: Role;
  content: string;
  sources?: ChatSource[];
  structured?: StructuredAnswer | null;
};
type BackendChatPayload = {
  answer?: string;
  error?: string;
  sources?: ChatSource[];
  session_id?: string;
  structured?: StructuredAnswer | null;
  detail?: string | { msg?: string }[];
};

const CHAT_REQUEST_TIMEOUT_MS = 300_000;

function parseErrorDetail(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "detail" in raw) {
    const d = (raw as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d))
      return d
        .map((x) => (typeof x === "object" && x && "msg" in x ? String((x as { msg?: unknown }).msg) : ""))
        .filter(Boolean)
        .join(" ");
  }
  if (raw && typeof raw === "object" && "error" in raw && typeof (raw as { error: unknown }).error === "string") {
    return (raw as { error: string }).error;
  }
  return "";
}

export default function ChatbotPanel({ welcome }: { welcome: string }) {
  const t = useTranslations("Chatbot");
  const { sessionId, syncFromServer } = useLegalAgentSession();
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: welcome }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container || !shouldAutoScrollRef.current) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function handleMessageScroll() {
    const container = messageContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 80;
  }

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [question]);

  const clearConversation = useCallback(() => {
    if (loading) return;
    setError(null);
    setHint(null);
    setQuestion("");
    setMessages([{ role: "assistant", content: welcome }]);
  }, [loading, welcome]);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const prompt = question.trim();
    if (!prompt || loading) return;
    if (prompt.length < 3) {
      setHint(t("minLengthHint"));
      window.setTimeout(() => setHint(null), 4000);
      return;
    }

    setQuestion("");
    setError(null);
    setHint(null);
    setLoading(true);

    const historyForApi = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user" as const, content: prompt },
    ];
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort("chat-timeout"), CHAT_REQUEST_TIMEOUT_MS);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          history: historyForApi,
          session_id: sessionId,
          profile: profile ?? null,
        }),
        signal: controller.signal,
      }).finally(() => {
        window.clearTimeout(timeoutId);
      });

      const payload = (await response.json()) as BackendChatPayload;

      if (!response.ok) {
        const detailStr = parseErrorDetail(payload);
        if (response.status === 429) {
          throw new Error(t("errorRateLimited"));
        }
        throw new Error(detailStr.trim() || t("error"));
      }

      if (payload.session_id) {
        syncFromServer(payload.session_id);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: payload.answer?.trim() ? payload.answer : t("noAnswer"),
          sources: payload.sources ?? [],
          structured: payload.structured ?? null,
        },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(t("errorTimeout"));
        return;
      }
      if (err instanceof TypeError) {
        const raw = String(err.message ?? "");
        if (/failed to fetch|load failed|networkerror/i.test(raw)) {
          setError(t("errorNetwork"));
          return;
        }
      }
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function onTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-lg-gold/25 bg-lg-gold/10 font-logo text-sm font-semibold text-lg-gold">
            A
          </div>
          <div className="min-w-0">
            <p className="font-app-serif text-[15px] font-semibold leading-tight text-white">{t("title")}</p>
            <p className="truncate text-[11px] font-light text-white/45">{t("subtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => clearConversation()}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-white/70 transition hover:border-lg-gold/35 hover:text-white disabled:opacity-40"
        >
          <IconRefresh size={14} />
          <span className="whitespace-nowrap">{t("newChat")}</span>
        </button>
      </header>

      <div
        ref={messageContainerRef}
        aria-live="polite"
        onScroll={handleMessageScroll}
        className="flex min-h-0 flex-1 touch-pan-y flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {messages.map((m, i) => (
            <div key={`msg-${i}`} className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/30">
                {m.role === "user" ? t("you") : t("bot")}
              </span>
              {m.role === "user" ? (
                <div className="self-end max-w-[85%] rounded-lg border border-lg-gold/25 bg-lg-gold/10 px-3.5 py-2.5 text-[15px] leading-relaxed text-white">
                  <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.content}</p>
                </div>
              ) : m.structured ? (
                <LegalNoteRenderer structured={m.structured} />
              ) : (
                <div className="text-[15px] leading-relaxed text-white/90">
                  <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.content}</p>
                </div>
              )}
              {m.role === "assistant" && m.sources && m.sources.length > 0 ? (
                <SourceList sources={m.sources} />
              ) : null}
            </div>
          ))}

          {messages.length === 1 && !loading ? (
            <QuestionSuggestions
              disabled={loading}
              onPick={(text) => {
                setQuestion(text);
                textareaRef.current?.focus();
              }}
            />
          ) : null}

          {loading ? (
            <div className="flex flex-col gap-1.5" role="status" aria-live="polite" aria-busy="true">
              <span className="text-[10px] uppercase tracking-wider text-white/30">{t("bot")}</span>
              <div className="flex items-center gap-2 text-[13px] italic text-white/55">
                <span className="flex gap-1" aria-hidden>
                  <span className="inline-block size-1.5 animate-bounce rounded-full bg-lg-gold [animation-duration:1s] [animation-delay:0ms]" />
                  <span className="inline-block size-1.5 animate-bounce rounded-full bg-lg-gold [animation-duration:1s] [animation-delay:150ms]" />
                  <span className="inline-block size-1.5 animate-bounce rounded-full bg-lg-gold [animation-duration:1s] [animation-delay:300ms]" />
                </span>
                <span>{t("thinking")}</span>
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-3 sm:px-6">
        <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {error ? (
            <div className="rounded-md border border-red-400/35 bg-red-950/40 px-3 py-2 text-[12px] text-red-100/95" role="alert">
              {error}
            </div>
          ) : null}
          <div className="flex items-end gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 focus-within:border-lg-gold/40">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onTextareaKeyDown}
              placeholder={t("placeholder")}
              rows={1}
              disabled={loading}
              className="max-h-40 min-h-9 w-full resize-none bg-transparent text-[15px] text-white outline-none placeholder:text-white/30 disabled:opacity-50"
            />
            <button
              type="submit"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-lg-gold text-lg-navy transition hover:bg-lg-gold-light disabled:opacity-40"
              disabled={loading || question.trim().length < 3}
              aria-label={t("send")}
              title={question.trim().length < 3 ? t("minLengthHint") : t("send")}
            >
              <IconArrowUp size={16} />
            </button>
          </div>
          {hint ? (
            <p className="text-center text-[11px] text-amber-200/90" role="alert">
              {hint}
            </p>
          ) : null}
          <p className="text-center text-[10px] text-white/35">{t("disclaimer")}</p>
        </form>
      </div>
    </div>
  );
}
