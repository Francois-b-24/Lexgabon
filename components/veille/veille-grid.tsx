"use client";

import {
  IconExternalLink,
  IconShare,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useVeilleFavorites } from "@/hooks/use-veille-favorites";
import { openVeilleSource } from "@/lib/veille/open-source";
import { cn } from "@/lib/utils";
import type { VeilleItemRow } from "@/lib/veille-service";

const SOURCE_BADGE: Record<string, string> = {
  "jo-ga": "bg-amber-800/20 text-amber-200",
  ohada: "bg-lg-gold/15 text-lg-gold-light",
  cemac: "bg-sky-500/15 text-sky-300",
  cobac: "bg-emerald-500/15 text-emerald-300",
  cima: "bg-violet-500/15 text-violet-200",
};

const SOURCE_LABEL: Record<string, string> = {
  "jo-ga": "Gabon",
  ohada: "OHADA",
  cemac: "CEMAC",
  cobac: "COBAC",
  cima: "CIMA",
};

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

/**
 * Grille client des items de veille. Les données viennent du SSR ; ce composant
 * gère seulement les favoris (localStorage) et le partage.
 */
export function VeilleGrid({ items }: { items: VeilleItemRow[] }) {
  const t = useTranslations("Veille");
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

  const handleShare = useCallback(
    async (card: VeilleItemRow) => {
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

  const filtered = favoritesOnly ? items.filter((c) => ids.has(c.id)) : items;

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {feedback ?? ""}
      </div>
      {feedback ? (
        <div
          className="fixed bottom-5 left-1/2 z-50 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-lg border border-white/15 bg-lg-navy px-4 py-2.5 text-center text-xs text-white shadow-lg"
          role="status"
        >
          {feedback}
        </div>
      ) : null}

      {ids.size > 0 ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
              favoritesOnly
                ? "border-lg-gold bg-lg-gold/15 text-lg-gold-light"
                : "border-white/15 text-white/60 hover:border-lg-gold/30 hover:text-white",
            )}
          >
            {t("favoritesOnly")} ({ids.size})
          </button>
        </div>
      ) : null}

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
              card.estNouveau &&
                "after:absolute after:right-3 after:top-3 after:h-1.5 after:w-1.5 after:rounded-full after:bg-lg-gold",
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  SOURCE_BADGE[card.source] ?? "bg-white/10 text-white/70",
                )}
              >
                {SOURCE_LABEL[card.source] ?? card.source}
              </span>
              {card.datePublication ? (
                <span className="ml-auto text-[10px] text-white/25">{card.datePublication}</span>
              ) : null}
            </div>
            <h3 className="font-app-serif text-sm font-semibold leading-snug text-white">
              {card.titre}
            </h3>
            {card.resume ? (
              <p className="mt-2 text-[11px] font-light leading-relaxed text-white/50">
                {card.resume}
              </p>
            ) : null}
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

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/40">{t("noResults")}</p>
      ) : null}
    </>
  );
}
