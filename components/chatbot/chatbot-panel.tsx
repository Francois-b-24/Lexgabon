"use client";

import { IconAlertTriangle, IconArrowUp, IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLegalAgentSession } from "@/hooks/use-legal-agent-session";
import { loadIndexedSources } from "@/lib/veille/indexed-sources-storage";

type Role = "user" | "assistant";
type SourceBadge = {
  citation: string;
  text: string;
  score: number;
  badge: string;
  slug?: string | null;
  numero_article?: string | null;
};
type ChatQuality = { has_citation?: boolean; has_disclaimer?: boolean };
type ChatMsg = {
  role: Role;
  content: string;
  sources?: SourceBadge[];
  quality?: ChatQuality;
  warnings?: string[];
};
type BackendChatPayload = {
  answer?: string;
  error?: string;
  sources?: SourceBadge[];
  quality?: ChatQuality;
  session_id?: string;
  warnings?: string[];
};

const CHAT_REQUEST_TIMEOUT_MS = 300_000;
const CHAT_PROXY_PATH = "/api/chat";

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

function ChatSourcesPanel({ sources }: { sources: SourceBadge[] }) {
  const t = useTranslations("Chatbot");
  if (!sources.length) return null;
  return (
    <div className="mt-2 w-full max-w-[min(92%,28rem)] rounded-xl border border-lg-gold/20 bg-white/[0.04] px-3 py-2.5 text-[11px] text-white/75 sm:max-w-[78%]">
      <p className="mb-1 font-semibold text-lg-gold/95">{t("sourcesTitle")}</p>
      <p className="mb-2 text-[10px] leading-snug text-white/50">{t("sourcesBlockIntro")}</p>
      <p className="mb-2 text-[10px] text-white/40">{t("sourcesCount", { count: sources.length })}</p>
      <ul className="space-y-3">
        {sources.slice(0, 8).map((s, idx) => (
          <li key={idx} className="border-l-2 border-lg-gold/35 pl-2.5">
            <div className="flex flex-col gap-1.5">
              <div>
                <span className="text-lg-gold/85">[{s.badge}]</span> {s.citation}
                <span className="text-white/35"> · score {(s.score ?? 0).toFixed(2)}</span>
              </div>
              {s.numero_article?.trim() ? (
                <p className="text-[10px] leading-snug text-white/55">
                  {t("sourceDispositionIndexed", { article: s.numero_article.trim() })}
                </p>
              ) : null}
              {s.slug?.trim() ? (
                <Link
                  href={`/textes/${encodeURIComponent(s.slug.trim())}`}
                  className="w-fit text-[10px] font-medium text-lg-gold/95 underline-offset-2 hover:underline"
                >
                  {t("sourceViewTexte")}
                </Link>
              ) : null}
              {s.text?.trim() ? (
                <details open className="rounded border border-white/10 bg-black/25">
                  <summary className="cursor-pointer select-none px-2 py-1.5 text-[10px] text-white/60 hover:text-white/85">
                    {t("sourceExcerptSummary")}
                  </summary>
                  <p className="max-h-52 overflow-y-auto whitespace-pre-wrap border-t border-white/10 px-2 py-2 text-[11px] font-light leading-relaxed text-white/75">
                    {s.text}
                  </p>
                </details>
              ) : null}
              <Link
                href={`/recherche?q=${encodeURIComponent(s.citation)}`}
                className="w-fit text-[10px] text-lg-gold/90 underline-offset-2 hover:underline"
              >
                {t("verifySourceSearch")}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChatbotPanel({ welcome }: { welcome: string }) {
  const t = useTranslations("Chatbot");
  const { sessionId, syncFromServer, rotateAfterServerClear } = useLegalAgentSession();
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: welcome }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [includeUploads, setIncludeUploads] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!sessionId) return;
    setIncludeUploads(loadIndexedSources(sessionId).length > 0);
  }, [sessionId]);

  const clearConversation = useCallback(() => {
    if (loading) return;
    setError(null);
    setHint(null);
    setQuestion("");
    setMessages([{ role: "assistant", content: welcome }]);
  }, [loading, welcome]);

  const resetSessionAndIndexed = useCallback(async () => {
    if (loading) return;
    if (typeof window !== "undefined" && !window.confirm(t("resetSessionConfirm"))) return;
    const sid = sessionId;
    if (sid) {
      try {
        await fetch("/api/session/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid }),
        });
      } catch {
        /* continue local rotation */
      }
    }
    rotateAfterServerClear();
    setIncludeUploads(false);
    setError(null);
    setHint(null);
    setQuestion("");
    setMessages([{ role: "assistant", content: welcome }]);
  }, [loading, rotateAfterServerClear, sessionId, t, welcome]);

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

    const historyForApi = [...messages.map(({ role, content }) => ({ role, content })), { role: "user" as const, content: prompt }];
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort("chat-timeout"), CHAT_REQUEST_TIMEOUT_MS);

      const response = await fetch(CHAT_PROXY_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          history: historyForApi,
          session_id: sessionId,
          include_uploads: includeUploads,
        }),
        signal: controller.signal,
      }).finally(() => {
        window.clearTimeout(timeoutId);
      });

      const payload = (await response.json()) as BackendChatPayload & {
        detail?: string | { msg?: string }[];
      };

      if (!response.ok) {
        const detailStr = parseErrorDetail(payload);
        throw new Error(
          (typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : detailStr.trim()) || t("error"),
        );
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
          quality: payload.quality,
          warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
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
      <header className="flex shrink-0 flex-col gap-3 border-b border-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-lg-gold/25 bg-lg-gold/15 font-logo text-sm font-bold text-lg-gold">
            A
          </div>
          <div className="min-w-0">
            <p className="font-app-serif text-[15px] font-semibold leading-tight text-white">{t("title")}</p>
            <p className="line-clamp-2 text-[10px] font-light text-white/50 sm:text-[11px] sm:line-clamp-none">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => void resetSessionAndIndexed()}
            disabled={loading}
            className="self-start rounded-md border border-amber-500/30 px-2 py-1.5 text-[10px] text-amber-200/90 hover:border-amber-400/50 disabled:opacity-40 sm:self-auto sm:text-[11px]"
          >
            {t("resetSessionFull")}
          </button>
          <button
            type="button"
            onClick={() => clearConversation()}
            disabled={loading}
            className="flex touch-manipulation items-center gap-1 self-start rounded-md border border-white/10 px-2 py-1.5 text-[10px] text-white/70 hover:border-lg-gold/30 hover:text-white disabled:opacity-40 sm:self-auto sm:text-[11px]"
          >
            <IconRefresh size={14} className="shrink-0" />
            <span className="whitespace-nowrap">{t("newChat")}</span>
          </button>
        </div>
      </header>

      <div
        className="mx-3 mt-2 flex shrink-0 items-start gap-2 rounded-lg border border-lg-gold/25 bg-lg-gold/10 px-3 py-2.5 sm:mx-6 sm:mt-2.5 sm:px-3.5"
        role="alert"
      >
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-lg-gold" />
        <p className="text-[11px] leading-snug text-white/70">
          <strong className="font-medium text-lg-gold-light">{t("disclaimerExact")}</strong> {t("disclaimerLegal")}
        </p>
      </div>

      <div
        ref={messageContainerRef}
        aria-live="polite"
        onScroll={handleMessageScroll}
        className="flex min-h-0 flex-1 touch-pan-y flex-col gap-3 overflow-y-auto px-3 py-3 sm:gap-3.5 sm:px-6 sm:py-4"
      >
        {messages.map((m, i) => (
          <div
            key={`msg-${i}`}
            className={`flex w-full max-w-[min(92%,28rem)] flex-col gap-1 sm:max-w-[78%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
          >
            <span className="px-1 text-[10px] text-white/25">{m.role === "user" ? t("you") : t("bot")}</span>
            <div
              className={`break-words rounded-2xl px-3 py-2.5 text-[13px] font-light leading-relaxed sm:px-4 ${
                m.role === "user"
                  ? "rounded-br-sm border border-lg-gold/25 bg-lg-gold/15 text-white"
                  : "rounded-bl-sm border border-white/10 bg-white/[0.05] text-white"
              }`}
            >
              <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.content}</p>
            </div>
            {m.role === "assistant" ? (
              <>
                {m.sources && m.sources.length > 0 ? <ChatSourcesPanel sources={m.sources} /> : null}
                {m.content !== welcome && (!m.sources || m.sources.length === 0) ? (
                  <div
                    className="mt-2 w-full max-w-[min(92%,28rem)] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] leading-snug text-white/55 sm:max-w-[78%]"
                    role="note"
                  >
                    {t("sourcesEmptyHint")}
                  </div>
                ) : null}
                {m.quality && (!m.quality.has_citation || !m.quality.has_disclaimer) ? (
                  <div className="mt-2 w-full max-w-[min(92%,28rem)] rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90 sm:max-w-[78%]">
                    {t("qualityPrudence")}
                  </div>
                ) : null}
                {m.quality && (m.quality.has_citation || m.quality.has_disclaimer) ? (
                  <div className="mt-1.5 flex w-full max-w-[min(92%,28rem)] flex-wrap gap-2 text-[10px] text-white/50 sm:max-w-[78%]">
                    <span
                      className={
                        m.quality.has_citation
                          ? "rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300"
                          : "rounded bg-white/5 px-2 py-0.5"
                      }
                    >
                      {t("qualityCitation")}: {m.quality.has_citation ? t("yes") : t("no")}
                    </span>
                    <span
                      className={
                        m.quality.has_disclaimer
                          ? "rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300"
                          : "rounded bg-amber-500/15 px-2 py-0.5 text-amber-200"
                      }
                    >
                      {t("qualityDisclaimer")}: {m.quality.has_disclaimer ? t("yes") : t("no")}
                    </span>
                  </div>
                ) : null}
                {m.warnings && m.warnings.length > 0 ? (
                  <div className="mt-2 w-full max-w-[min(92%,28rem)] rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90 sm:max-w-[78%]">
                    <p className="mb-1 font-medium text-amber-200">{t("warningsTitle")}</p>
                    <ul className="list-inside list-disc space-y-0.5">
                      {m.warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ))}

        {loading && (
          <div
            className="flex max-w-[min(92%,28rem)] flex-col gap-1 self-start sm:max-w-[78%]"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="px-1 text-[10px] text-white/25">{t("bot")}</span>
            <div className="rounded-2xl rounded-bl-sm border border-lg-gold/35 bg-white/[0.07] px-3 py-2.5 sm:px-4">
              <p className="text-[13px] font-medium leading-snug text-lg-gold-light">{t("thinkingTitle")}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex gap-1" aria-hidden>
                  <span className="inline-block size-1.5 animate-bounce rounded-full bg-lg-gold [animation-duration:1s] [animation-delay:0ms]" />
                  <span className="inline-block size-1.5 animate-bounce rounded-full bg-lg-gold [animation-duration:1s] [animation-delay:150ms]" />
                  <span className="inline-block size-1.5 animate-bounce rounded-full bg-lg-gold [animation-duration:1s] [animation-delay:300ms]" />
                </span>
                <span className="text-[11px] font-light italic text-white/45">{t("sending")}</span>
              </div>
              <p className="mt-2 text-[11px] font-light leading-snug text-white/55">{t("thinkingHint")}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 px-3 py-3 sm:px-6">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-2.5">
          {error ? (
            <div className="rounded-lg border border-red-400/35 bg-red-950/40 px-3 py-2 text-[12px] text-red-100/95" role="alert">
              {error}
            </div>
          ) : null}

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/70">
            <input
              type="checkbox"
              className="mt-0.5 accent-lg-gold"
              checked={includeUploads}
              onChange={(e) => setIncludeUploads(e.target.checked)}
              disabled={loading}
            />
            <span>
              <span className="font-medium text-white/85">{t("includeUploads")}</span>
              <span className="mt-0.5 block text-[10px] font-light text-white/45">{t("includeUploadsHint")}</span>
            </span>
          </label>

          <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-lg-gold/25 sm:px-3.5">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onTextareaKeyDown}
              placeholder={t("placeholder")}
              rows={1}
              disabled={loading}
              className="max-h-40 min-h-11 w-full resize-none bg-transparent text-[13px] font-light text-white outline-none placeholder:text-white/25 disabled:opacity-50"
            />
            <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-2">
              <button
                type="submit"
                className="grid h-9 w-9 shrink-0 touch-manipulation place-items-center rounded-md bg-lg-gold text-lg-navy disabled:opacity-40"
                disabled={loading || question.trim().length < 3}
                aria-label={t("send")}
                title={question.trim().length < 3 ? t("minLengthHint") : t("send")}
              >
                <IconArrowUp size={16} />
              </button>
            </div>
          </div>
          {hint ? (
            <p className="text-center text-[11px] text-amber-200/90" role="alert">
              {hint}
            </p>
          ) : null}
          <p className="text-center text-[10px] text-white/25">{t("textareaHint")}</p>
        </form>
      </div>
    </div>
  );
}
