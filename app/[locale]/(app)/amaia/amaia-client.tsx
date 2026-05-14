"use client";

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowUp,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

type HealthState = "checking" | "ready" | "degraded";

export default function AmaiaPage({ welcome }: { welcome: string }) {
  const t = useTranslations("Amaia");
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: welcome }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthState>("checking");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/amaia")
      .then((r) => r.json() as Promise<{ anthropicConfigured?: boolean }>)
      .then((data) => {
        if (cancelled) return;
        setHealth(data.anthropicConfigured ? "ready" : "degraded");
      })
      .catch(() => {
        if (!cancelled) setHealth("degraded");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    try {
      const res = await fetch("/api/amaia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              typeof err.message === "string"
                ? err.message
                : t("error"),
          },
        ]);
        setLoading(false);
        return;
      }
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("error") }]);
    }
    setLoading(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [input, loading, messages, t]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-lg-gold/25 bg-lg-gold/15 font-logo text-sm font-bold text-lg-gold">
            A
          </div>
          <div>
            <p className="font-app-serif text-[15px] font-semibold text-white">{t("title")}</p>
            <p className="text-[11px] font-light text-white/50">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          {health === "checking" && (
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
              {t("serviceChecking")}
            </span>
          )}
          {health === "ready" && (
            <span className="flex items-center gap-1.5 text-emerald-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("serviceReady")}
            </span>
          )}
          {health === "degraded" && (
            <span className="flex items-center gap-1.5 text-amber-400/90">
              <IconAlertCircle size={14} className="shrink-0" />
              {t("serviceDegraded")}
            </span>
          )}
        </div>
      </header>

      <div
        className="mx-6 mt-2.5 flex shrink-0 items-start gap-2 rounded-lg border border-lg-gold/25 bg-lg-gold/10 px-3.5 py-2.5"
        role="alert"
      >
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-lg-gold" />
        <p className="text-[11px] leading-snug text-white/70">
          <strong className="font-medium text-lg-gold-light">{t("disclaimerExact")}</strong>{" "}
          {t("disclaimerLegal")}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-6 py-4">
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}`}
            className={`flex max-w-[78%] flex-col gap-1 ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
          >
            <span className="px-1 text-[10px] text-white/25">{m.role === "user" ? t("you") : t("bot")}</span>
            <div
              className={`rounded-2xl px-4 py-2.5 text-[13px] font-light leading-relaxed ${
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
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 px-6 py-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 focus-within:border-lg-gold/25">
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
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-lg-gold text-lg-navy disabled:opacity-40"
            disabled={loading}
            aria-label={t("send")}
          >
            <IconArrowUp size={16} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-lg-gold/50">
          <IconAlertCircle size={12} />
          <span>{t("disclaimerExact")}</span>
          <span className="text-white/25">·</span>
          <span className="text-white/25">{t("inputNote")}</span>
        </div>
      </div>
    </div>
  );
}
