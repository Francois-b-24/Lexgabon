"use client";

import {
  IconBellRinging,
  IconExternalLink,
  IconFileUpload,
  IconLink,
  IconSearch,
  IconShare,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useVeilleFavorites } from "@/hooks/use-veille-favorites";
import { useLegalAgentSession } from "@/hooks/use-legal-agent-session";
import { mockVeille, type VeilleItem } from "@/lib/mock/veille";
import { openVeilleSource } from "@/lib/veille/open-source";
import { cn } from "@/lib/utils";
import {
  appendIndexedSource,
  loadIndexedSources,
  removeIndexedSource,
  type IndexedSourceEntry,
} from "@/lib/veille/indexed-sources-storage";

const badge: Record<VeilleItem["source"], string> = {
  OHADA: "bg-lg-gold/15 text-lg-gold-light",
  CEMAC: "bg-sky-500/15 text-sky-300",
  COBAC: "bg-emerald-500/15 text-emerald-300",
  Gabon: "bg-amber-800/20 text-amber-200",
};

const SOURCES: Array<VeilleItem["source"] | "all"> = ["all", "Gabon", "OHADA", "CEMAC", "COBAC"];

async function copyUrlToClipboard(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function VeillePage() {
  const t = useTranslations("Veille");
  const locale = useLocale();
  const { sessionId, rotateAfterServerClear } = useLegalAgentSession();
  const [q, setQ] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<(typeof SOURCES)[number]>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [mySources, setMySources] = useState<IndexedSourceEntry[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [urlBusy, setUrlBusy] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ids, toggle, has } = useVeilleFavorites();

  const showFeedback = useCallback((message: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(message);
    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimer.current = null;
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const reloadSources = useCallback(() => {
    if (sessionId) setMySources(loadIndexedSources(sessionId));
  }, [sessionId]);

  useEffect(() => {
    reloadSources();
  }, [reloadSources]);

  const handlePdf = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !sessionId) return;
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        showFeedback(t("uploadNotPdf"));
        return;
      }
      setPdfBusy(true);
      try {
        const fd = new FormData();
        fd.append("session_id", sessionId);
        fd.append("file", file);
        const res = await fetch("/api/upload-pdf", { method: "POST", body: fd });
        const data = (await res.json()) as { ok?: boolean; chunks?: number; detail?: string };
        if (!res.ok) {
          showFeedback(typeof data.detail === "string" ? data.detail : t("uploadError"));
          return;
        }
        const n = data.chunks ?? 0;
        appendIndexedSource(sessionId, {
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pdf-${Date.now()}`,
          kind: "pdf",
          label: file.name,
          chunks: n,
          createdAt: new Date().toISOString(),
        });
        reloadSources();
        showFeedback(t("chunksIndexed", { count: n }));
      } catch {
        showFeedback(t("uploadError"));
      } finally {
        setPdfBusy(false);
      }
    },
    [reloadSources, sessionId, showFeedback, t],
  );

  const handleUrlIngest = useCallback(async () => {
    if (!sessionId || !urlInput.trim()) return;
    setUrlBusy(true);
    try {
      const res = await fetch("/api/ingest-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, url: urlInput.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; chunks?: number; detail?: string };
      if (!res.ok) {
        showFeedback(typeof data.detail === "string" ? data.detail : t("urlError"));
        return;
      }
      const n = data.chunks ?? 0;
      const u = urlInput.trim();
      appendIndexedSource(sessionId, {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `url-${Date.now()}`,
        kind: "url",
        label: u,
        chunks: n,
        createdAt: new Date().toISOString(),
        url: u,
      });
      setUrlInput("");
      reloadSources();
      showFeedback(t("chunksIndexed", { count: n }));
    } catch {
      showFeedback(t("urlError"));
    } finally {
      setUrlBusy(false);
    }
  }, [reloadSources, sessionId, t, urlInput, showFeedback]);

  const handleRemoveSource = useCallback(
    (id: string) => {
      if (!sessionId) return;
      removeIndexedSource(sessionId, id);
      reloadSources();
    },
    [reloadSources, sessionId],
  );

  const handleResetSession = useCallback(async () => {
    if (typeof window !== "undefined" && !window.confirm(t("resetSessionConfirm"))) return;
    if (sessionId) {
      try {
        await fetch("/api/session/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch {
        /* */
      }
    }
    rotateAfterServerClear();
    setMySources([]);
    setUrlInput("");
    showFeedback(t("sessionResetDone"));
  }, [rotateAfterServerClear, sessionId, showFeedback, t]);

  const newCount = useMemo(() => mockVeille.filter((c) => c.isNew).length, []);

  const filtered = useMemo(() => {
    let list = mockVeille;
    if (sourceFilter !== "all") {
      list = list.filter((c) => c.source === sourceFilter);
    }
    if (favoritesOnly) {
      list = list.filter((c) => ids.has(c.id));
    }
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (c) =>
        c.titre.toLowerCase().includes(s) ||
        c.resume.toLowerCase().includes(s) ||
        c.portal.toLowerCase().includes(s),
    );
  }, [q, sourceFilter, favoritesOnly, ids]);

  const handleShare = useCallback(
    async (card: VeilleItem) => {
      const data: ShareData = {
        title: card.titre,
        text: `${card.titre}\n${card.url}`,
        url: card.url,
      };
      if (typeof navigator.share === "function") {
        try {
          if (!navigator.canShare || navigator.canShare(data)) {
            await navigator.share(data);
            return;
          }
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }
      const ok = await copyUrlToClipboard(card.url);
      showFeedback(ok ? t("toastLinkCopied") : t("toastShareError"));
    },
    [showFeedback, t],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div aria-live="polite" className="sr-only">
        {feedback ?? ""}
      </div>
      {feedback && (
        <div
          className="fixed bottom-5 left-1/2 z-50 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-lg border border-white/15 bg-lg-navy px-4 py-2.5 text-center text-xs text-white shadow-lg"
          role="status"
        >
          {feedback}
        </div>
      )}

      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-lg-app-navy px-5 py-3.5">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <IconSearch size={14} className="text-white/25" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <p className="hidden shrink-0 items-center gap-1.5 text-[11px] text-white/25 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {t("updated")} ·{" "}
          {new Date().toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {showAlert && (
        <div className="mx-5 mt-3 flex items-center justify-between rounded-lg border border-lg-gold/25 bg-lg-gold/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <IconBellRinging size={16} className="text-lg-gold" />
            <p className="text-xs text-lg-gold-light">
              <strong>{t("alertIntro", { count: newCount })}</strong> {t("alertOutro")}
            </p>
          </div>
          <button
            type="button"
            className="text-lg-gold/40 hover:text-lg-gold"
            aria-label={t("dismissAlert")}
            onClick={() => setShowAlert(false)}
          >
            <IconX size={18} />
          </button>
        </div>
      )}

      <div className="flex-1 space-y-4 p-3.5 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/35">{t("filterBySource")}</span>
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                    sourceFilter === src
                      ? "bg-lg-gold text-lg-navy"
                      : "border border-white/15 bg-white/5 text-white/60 hover:border-lg-gold/30 hover:text-white",
                  )}
                >
                  {src === "all" ? t("filterAll") : src}
                </button>
              ))}
            </div>
          </div>
          {ids.size > 0 && (
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={cn(
                "self-start rounded-full border px-3 py-1 text-[11px] font-medium transition-colors sm:self-auto",
                favoritesOnly
                  ? "border-lg-gold bg-lg-gold/15 text-lg-gold-light"
                  : "border-white/15 text-white/60 hover:border-lg-gold/30 hover:text-white",
              )}
            >
              {t("favoritesOnly")}
              {ids.size > 0 ? ` (${ids.size})` : ""}
            </button>
          )}
        </div>

        <section className="rounded-[11px] border border-lg-gold/20 bg-lg-gold/5 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-app-serif text-sm font-semibold text-lg-gold-light">{t("mySourcesTitle")}</h2>
              <p className="mt-1 max-w-2xl text-[11px] font-light leading-relaxed text-white/55">{t("mySourcesIntro")}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleResetSession()}
              className="shrink-0 rounded-md border border-amber-500/35 px-2.5 py-1.5 text-[10px] text-amber-200/90 hover:border-amber-400/50"
            >
              {t("resetSession")}
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-[11px] text-white/75 hover:border-lg-gold/30">
              <IconFileUpload size={16} className="shrink-0 text-lg-gold" />
              <span>{pdfBusy ? t("indexing") : t("uploadPdfLabel")}</span>
              <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={pdfBusy || !sessionId} onChange={(e) => void handlePdf(e)} />
            </label>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2">
                <IconLink size={16} className="shrink-0 text-lg-gold" />
                <input
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder={t("urlPlaceholder")}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={urlBusy || !sessionId}
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/25"
                />
              </div>
              <button
                type="button"
                disabled={urlBusy || !sessionId || urlInput.trim().length < 12}
                onClick={() => void handleUrlIngest()}
                className="rounded-lg border border-lg-gold/40 bg-lg-gold/15 px-3 py-2 text-[11px] font-medium text-lg-gold-light hover:bg-lg-gold/25 disabled:opacity-40"
              >
                {urlBusy ? t("indexing") : t("indexUrl")}
              </button>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-white/35">{t("mySourcesAllowlistHint")}</p>
          {mySources.length > 0 ? (
            <ul className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {mySources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px]"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-lg-gold/90">{s.kind === "pdf" ? t("kindPdf") : t("kindUrl")}</span>
                    <p className="mt-0.5 truncate text-white/70" title={s.label}>
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/40">
                      {t("chunksIndexed", { count: s.chunks })} · {new Date(s.createdAt).toLocaleString(locale === "en" ? "en-GB" : "fr-FR")}
                    </p>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[10px] text-lg-gold/90 hover:underline">
                        <IconExternalLink size={12} />
                        {t("openIndexedUrl")}
                      </a>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label={t("removeSource")}
                    onClick={() => handleRemoveSource(s.id)}
                    className="shrink-0 rounded p-1 text-white/30 hover:text-red-300"
                  >
                    <IconTrash size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/35">{t("mySourcesEmpty")}</p>
          )}
        </section>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((card) => (
            <article
              key={card.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a,button")) return;
                openVeilleSource(card.url);
              }}
              className={cn(
                "relative cursor-pointer rounded-[11px] border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-lg-gold/25 hover:bg-white/[0.05]",
                card.isNew && "after:absolute after:right-3 after:top-3 after:h-1.5 after:w-1.5 after:rounded-full after:bg-lg-gold",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    badge[card.source],
                  )}
                >
                  {card.source}
                </span>
                <span className="ml-auto text-[10px] text-white/25">{card.date}</span>
              </div>
              <h3 className="font-app-serif text-sm font-semibold leading-snug text-white">{card.titre}</h3>
              <p className="mt-2 text-[11px] font-light leading-relaxed text-white/50">{card.resume}</p>
              <div className="mt-3 flex items-center justify-between">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-white/25 hover:text-lg-gold"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconExternalLink size={12} />
                  {card.portal}
                </a>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={cn(
                      "rounded p-1 transition-colors hover:text-lg-gold",
                      has(card.id) ? "text-lg-gold" : "text-white/25",
                    )}
                    aria-label={has(card.id) ? t("ariaRemoveFavorite") : t("ariaAddFavorite")}
                    aria-pressed={has(card.id)}
                    onClick={() => toggle(card.id)}
                  >
                    {has(card.id) ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-white/25 hover:text-lg-gold"
                    aria-label={t("ariaShare")}
                    onClick={() => void handleShare(card)}
                  >
                    <IconShare size={16} />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-white/25 hover:text-lg-gold"
                    aria-label={t("ariaConsultSource")}
                    onClick={() => openVeilleSource(card.url)}
                  >
                    <IconExternalLink size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-white/40">{t("noResults")}</p>
        )}
        <p className="mx-auto max-w-3xl text-center text-[10px] leading-relaxed text-white/35">{t("curatedFootnote")}</p>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] leading-relaxed text-white/30">{t("sourceOpenHint")}</p>
      </div>
    </div>
  );
}
