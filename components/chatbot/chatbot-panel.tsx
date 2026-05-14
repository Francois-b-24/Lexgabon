"use client";

import { IconAlertTriangle, IconArrowUp, IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

type Role = "user" | "assistant";
type ChatMsg = { role: Role; content: string };
type SourceBadge = {
  citation: string;
  text: string;
  score: number;
  badge: string;
  slug?: string | null;
  numero_article?: string | null;
};
type ChatQuality = { has_citation?: boolean; has_disclaimer?: boolean };
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

export default function ChatbotPanel({ welcome }: { welcome: string }) {
  const t = useTranslations("Chatbot");
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: welcome }]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastSources, setLastSources] = useState<SourceBadge[]>([]);
  const [lastQuality, setLastQuality] = useState<ChatQuality | null>(null);
  const [lastWarnings, setLastWarnings] = useState<string[]>([]);
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

  const clearConversation = useCallback(async () => {
    if (loading) return;
    setError(null);
    setHint(null);
    setQuestion("");
    setLastSources([]);
    setLastQuality(null);
    setLastWarnings([]);
    setMessages([{ role: "assistant", content: welcome }]);

    if (!sessionId) {
      setSessionId(null);
      return;
    }

    try {
      await fetch("/api/session/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch {
      /* reset local state even if server clear fails */
    } finally {
      setSessionId(null);
    }
  }, [loading, sessionId, welcome]);

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
    setLastSources([]);
    setLastQuality(null);
    setLastWarnings([]);

    const history: ChatMsg[] = [...messages, { role: "user", content: prompt }];
    setMessages(history);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort("chat-timeout"), CHAT_REQUEST_TIMEOUT_MS);

      const response = await fetch(CHAT_PROXY_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          history,
          session_id: sessionId,
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

      setLastSources(payload.sources ?? []);
      setLastQuality(payload.quality ?? null);
      setLastWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
      if (payload.session_id) {
        setSessionId(payload.session_id);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: payload.answer?.trim() ? payload.answer : t("noAnswer") },
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
        <button
          type="button"
          onClick={() => void clearConversation()}
          disabled={loading}
          className="flex touch-manipulation items-center gap-1 self-start rounded-md border border-white/10 px-2 py-1.5 text-[10px] text-white/70 hover:border-lg-gold/30 hover:text-white disabled:opacity-40 sm:self-auto sm:text-[11px]"
        >
          <IconRefresh size={14} className="shrink-0" />
          <span className="whitespace-nowrap">{t("newChat")}</span>
        </button>
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
            key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
            className={`flex max-w-[min(92%,28rem)] flex-col gap-1 sm:max-w-[78%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
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

        {lastSources.length > 0 && (
          <div className="max-w-full self-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/70">
            <p className="mb-1.5 font-medium text-lg-gold/90">{t("sourcesTitle")}</p>
            <p className="mb-1.5 text-white/45">{t("sourcesCount", { count: lastSources.length })}</p>
            <ul className="space-y-2.5">
              {lastSources.slice(0, 8).map((s, idx) => (
                <li key={idx} className="border-l border-lg-gold/30 pl-2">
                  <div className="flex flex-col gap-1.5">
                    <div>
                      <span className="text-lg-gold/80">[{s.badge}]</span> {s.citation}
                      <span className="text-white/35"> · score {(s.score ?? 0).toFixed(2)}</span>
                    </div>
                    {s.numero_article?.trim() ? (
                      <p className="text-[10px] leading-snug text-white/50">
                        {t("sourceDispositionIndexed", { article: s.numero_article.trim() })}
                      </p>
                    ) : null}
                    {s.slug?.trim() ? (
                      <Link
                        href={`/textes/${encodeURIComponent(s.slug.trim())}`}
                        className="w-fit text-[10px] text-lg-gold/90 underline-offset-2 hover:underline"
                      >
                        {t("sourceViewTexte")}
                      </Link>
                    ) : null}
                    {s.text?.trim() ? (
                      <details className="group rounded border border-white/10 bg-black/20">
                        <summary className="cursor-pointer select-none px-2 py-1 text-[10px] text-white/55 hover:text-white/80">
                          {t("sourceExcerptSummary")}
                        </summary>
                        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap border-t border-white/10 px-2 py-1.5 text-[10px] font-light leading-snug text-white/65">
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
        )}

        {lastQuality && (!lastQuality.has_citation || !lastQuality.has_disclaimer) && (
          <div className="max-w-full self-start rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
            {t("qualityPrudence")}
          </div>
        )}

        {lastQuality && (lastQuality.has_citation || lastQuality.has_disclaimer) && (
          <div className="flex flex-wrap gap-2 self-start text-[10px] text-white/50">
            <span
              className={
                lastQuality.has_citation ? "rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300" : "rounded bg-white/5 px-2 py-0.5"
              }
            >
              {t("qualityCitation")}: {lastQuality.has_citation ? t("yes") : t("no")}
            </span>
            <span
              className={
                lastQuality.has_disclaimer
                  ? "rounded bg-emerald-500/15 px-2 py-0.5 text-emerald-300"
                  : "rounded bg-amber-500/15 px-2 py-0.5 text-amber-200"
              }
            >
              {t("qualityDisclaimer")}: {lastQuality.has_disclaimer ? t("yes") : t("no")}
            </span>
          </div>
        )}

        {lastWarnings.length > 0 && (
          <div className="max-w-full self-start rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90">
            <p className="mb-1 font-medium text-amber-200">{t("warningsTitle")}</p>
            <ul className="list-inside list-disc space-y-0.5">
              {lastWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
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
