"use client";

import {
  IconBellRinging,
  IconExternalLink,
  IconSearch,
  IconShare,
  IconStar,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useVeilleFavorites } from "@/hooks/use-veille-favorites";
import { mockVeille, type VeilleItem } from "@/lib/mock/veille";
import { openVeilleSource } from "@/lib/veille/open-source";
import { cn } from "@/lib/utils";

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
  const [q, setQ] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<(typeof SOURCES)[number]>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
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
