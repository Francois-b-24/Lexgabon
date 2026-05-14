"use client";

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowUp,
  IconRefresh,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

type ChatMsg = { role: Role; content: string };

type ChatApiSource = { citation: string; text: string; score: number; badge: string };

type ChatApiResponse = {
  answer: string;
  sources: ChatApiSource[];
  quality?: { has_citation?: boolean; has_disclaimer?: boolean };
  session_id: string;
  tools_used?: string[];
  warnings?: string[];
};

const DOMAIN_ENTRIES = [
  { value: "", labelKey: "domainAuto" },
  { value: "general", labelKey: "domainGeneral" },
  { value: "civil", labelKey: "domainCivil" },
  { value: "penal", labelKey: "domainPenal" },
  { value: "commercial", labelKey: "domainCommercial" },
  { value: "travail", labelKey: "domainTravail" },
  { value: "administratif", labelKey: "domainAdministratif" },
  { value: "fiscal", labelKey: "domainFiscal" },
  { value: "famille", labelKey: "domainFamille" },
] as const;

const CHAT_TIMEOUT_MS = 90_000;

function parseErrorDetail(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "detail" in raw) {
    const d = (raw as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => JSON.stringify(x)).join(" ");
  }
  return "";
}

export default function ChatbotPanel({ welcome }: { welcome: string }) {
  const t = useTranslations("Chatbot");
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: welcome }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [health, setHealth] = useState<"checking" | "ready" | "degraded">("checking");
  const [lastSources, setLastSources] = useState<ChatApiSource[]>([]);
  const [lastQuality, setLastQuality] = useState<ChatApiResponse["quality"] | null>(null);
  const [lastWarnings, setLastWarnings] = useState<string[]>([]);
  const [domain, setDomain] = useState<string>("");
  const [includeUploads, setIncludeUploads] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/health")
      .then((r) => r.json() as Promise<{ ok?: boolean }>)
      .then((data) => {
        if (cancelled) return;
        setHealth(data.ok ? "ready" : "degraded");
      })
      .catch(() => {
        if (!cancelled) setHealth("degraded");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const clearConversation = useCallback(async () => {
    if (sessionId) {
      try {
        await fetch("/api/session/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch {
        /* CDC : réinitialiser l'état même si l'appel échoue */
      }
    }
    setSessionId(null);
    setMessages([{ role: "assistant", content: welcome }]);
    setLastSources([]);
    setLastQuality(null);
    setLastWarnings([]);
    setDomain("");
    setIncludeUploads(false);
    setPdfFile(null);
  }, [sessionId, welcome]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (text.length < 3 || loading) return;
    setInput("");
    setLoading(true);
    const nextMsgs: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMsgs);

    const history = nextMsgs.map((m) => ({ role: m.role, content: m.content }));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    const sid = sessionId ?? crypto.randomUUID();

    try {
      if (pdfFile) {
        const fd = new FormData();
        fd.append("session_id", sid);
        fd.append("file", pdfFile);
        const up = await fetch("/api/upload-pdf", {
          method: "POST",
          body: fd,
          signal: controller.signal,
        });
        if (!up.ok) {
          clearTimeout(timer);
          let errText = t("uploadFailed");
          try {
            const j = (await up.json()) as unknown;
            errText = parseErrorDetail(j) || errText;
          } catch {
            /* ignore */
          }
          setMessages((m) => [...m, { role: "assistant", content: errText }]);
          setLoading(false);
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          question: text,
          history,
          session_id: sid,
          include_uploads: includeUploads,
          ...(domain ? { domaine: domain } : {}),
        }),
      });
      clearTimeout(timer);

      if (!res.ok) {
        let errText = t("error");
        try {
          const j = (await res.json()) as unknown;
          errText = parseErrorDetail(j) || errText;
        } catch {
          errText = res.status === 429 ? t("errorRateLimited") : errText;
        }
        setMessages((m) => [...m, { role: "assistant", content: errText }]);
        setLoading(false);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      const data = (await res.json()) as ChatApiResponse;
      setSessionId(data.session_id);
      setLastSources(data.sources ?? []);
      setLastQuality(data.quality ?? null);
      setLastWarnings(data.warnings ?? []);
      setMessages((m) => [...m, { role: "assistant", content: data.answer ?? "" }]);
      setPdfFile(null);
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof Error && e.name === "AbortError";
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: aborted ? t("errorTimeout") : t("errorNetwork"),
        },
      ]);
    }
    setLoading(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [input, loading, messages, sessionId, t, domain, includeUploads, pdfFile]);

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
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => void clearConversation()}
            className="flex touch-manipulation items-center gap-1 rounded-md border border-white/10 px-2 py-1.5 text-[10px] text-white/70 hover:border-lg-gold/30 hover:text-white sm:text-[11px]"
          >
            <IconRefresh size={14} className="shrink-0" />
            <span className="whitespace-nowrap">{t("newChat")}</span>
          </button>
          <div className="min-w-0 text-[10px] sm:text-[11px]">
            {health === "checking" && <span className="text-white/40">{t("serviceChecking")}</span>}
            {health === "ready" && <span className="text-emerald-400/90">{t("serviceReady")}</span>}
            {health === "degraded" && (
              <span className="flex items-center gap-1 text-amber-400/90">
                <IconAlertCircle size={14} className="shrink-0" />
                <span className="break-words">{t("serviceDegraded")}</span>
              </span>
            )}
          </div>
        </div>
      </header>

      <div
        className="mx-3 mt-2 flex shrink-0 items-start gap-2 rounded-lg border border-lg-gold/25 bg-lg-gold/10 px-3 py-2.5 sm:mx-6 sm:mt-2.5 sm:px-3.5"
        role="alert"
      >
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-lg-gold" />
        <p className="text-[11px] leading-snug text-white/70">
          <strong className="font-medium text-lg-gold-light">{t("disclaimerExact")}</strong>{" "}
          {t("disclaimerLegal")}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain px-3 py-3 sm:gap-3.5 sm:px-6 sm:py-4">
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}-${m.content.slice(0, 12)}`}
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
              {m.content.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
        ))}

        {lastSources.length > 0 && (
          <div className="max-w-full self-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/70">
            <p className="mb-1.5 font-medium text-lg-gold/90">{t("sourcesTitle")}</p>
            <ul className="space-y-1.5">
              {lastSources.slice(0, 8).map((s, i) => (
                <li key={i} className="border-l border-lg-gold/30 pl-2">
                  <span className="text-lg-gold/80">[{s.badge}]</span> {s.citation}
                  <span className="text-white/35"> · score {(s.score ?? 0).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lastQuality && (
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
        <div className="mb-2.5 flex flex-col gap-2 text-[11px] text-white/70">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-white/45">{t("domainLabel")}</span>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="min-h-11 w-full max-w-full rounded-md border border-white/15 bg-white/5 px-2 py-2 text-[12px] text-white outline-none focus:border-lg-gold/30"
            >
              {DOMAIN_ENTRIES.map((d) => (
                <option key={d.value || "auto"} value={d.value}>
                  {t(d.labelKey)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-start gap-2 sm:items-center">
            <input
              type="checkbox"
              checked={includeUploads}
              onChange={(e) => setIncludeUploads(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-white/10 touch-manipulation sm:mt-0"
            />
            <span className="min-w-0 leading-snug">{t("includeUploads")}</span>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-white/45">{t("pdfLabel")}</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="min-w-0 max-w-full text-[11px] file:mr-2 file:rounded file:border-0 file:bg-lg-gold/20 file:px-2 file:py-1 file:text-white"
            />
          </label>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-lg-gold/25 sm:gap-2.5 sm:px-3.5">
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] font-light text-white outline-none placeholder:text-white/25"
            placeholder={t("placeholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send()}
          />
          <button
            type="button"
            onClick={() => void send()}
            className="grid h-9 w-9 shrink-0 touch-manipulation place-items-center rounded-md bg-lg-gold text-lg-navy disabled:opacity-40 sm:h-8 sm:w-8"
            disabled={loading}
            aria-label={t("send")}
          >
            <IconArrowUp size={16} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/25">{t("inputNote")}</p>
      </div>
    </div>
  );
}
