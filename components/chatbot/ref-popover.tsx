"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconExternalLink } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import type { StructuredRef } from "@/lib/chatbot-types";

type ArticleApiResponse =
  | {
      found: true;
      numero: string;
      titre: string | null;
      titreSection: string | null;
      contenu: string;
      texteSlug: string;
      texteTitre: string;
      texteReference: string;
      source: string;
      permalink: string;
    }
  | { found: false; error?: string };

/**
 * Badge cliquable pour une référence légale extraite par le parser (T2.3).
 *
 * Comportements :
 * - Article avec `slug` + `source` : Link interne `/textes/<source>/<slug>#article-N`
 *   + popover lazy au survol/clic.
 * - Article avec `url` (externe) : <a target=_blank>.
 * - Source libre avec `slug` + `source` : Link interne sans popover.
 * - Source libre sans rien : <span> simple.
 */
export function RefBadgeLink({ refItem }: { refItem: StructuredRef }) {
  const isArticle = refItem.kind === "article";
  const baseClasses = isArticle
    ? "inline-flex items-center rounded bg-lg-gold/15 px-1.5 py-0.5 text-[11px] font-medium text-lg-gold-light"
    : "inline-flex items-center rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-white/75";
  const hoverClasses = " transition hover:bg-lg-gold/25 hover:text-white";

  // Lien interne fiche texte (avec ancre article si dispo).
  const internalHref =
    refItem.slug && refItem.source
      ? `/textes/${refItem.source}/${encodeURIComponent(refItem.slug)}${
          refItem.article ? `#article-${refItem.article}` : ""
        }`
      : null;

  if (!isArticle) {
    // Source libre : pas de popover, juste lien interne ou externe.
    if (internalHref) {
      return (
        <Link href={internalHref} className={baseClasses + hoverClasses}>
          {refItem.label}
        </Link>
      );
    }
    if (refItem.url) {
      return (
        <a
          href={refItem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses + hoverClasses}
        >
          {refItem.label}
          <IconExternalLink size={10} className="ml-1" />
        </a>
      );
    }
    return <span className={baseClasses}>{refItem.label}</span>;
  }

  // Article : popover + Link interne si possible, sinon lien externe.
  return (
    <ArticlePopover
      refItem={refItem}
      internalHref={internalHref}
      baseClasses={baseClasses + hoverClasses}
    />
  );
}

function ArticlePopover({
  refItem,
  internalHref,
  baseClasses,
}: {
  refItem: StructuredRef;
  internalHref: string | null;
  baseClasses: string;
}) {
  const t = useTranslations("Chatbot.popover");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ArticleApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    if (data || loading || !refItem.slug || !refItem.article) return;
    setLoading(true);
    try {
      const url = `/api/articles?slug=${encodeURIComponent(
        refItem.slug,
      )}&numero=${encodeURIComponent(refItem.article)}`;
      const res = await fetch(url);
      const json = (await res.json()) as ArticleApiResponse;
      setData(json);
    } catch {
      setData({ found: false });
    } finally {
      setLoading(false);
    }
  }, [data, loading, refItem.slug, refItem.article]);

  useEffect(() => {
    if (!open) return;
    void fetchData();
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, fetchData]);

  const handleEnter = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setOpen(true);
      void fetchData();
    }, 220);
  }, [fetchData]);

  const handleLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  const handleClickTrigger = useCallback(
    (e: React.MouseEvent) => {
      // Sur mobile (pas de hover), le clic ouvre le popover sans naviguer.
      // Sur desktop avec lien interne, on laisse Link gérer mais on ouvre aussi le popover pour aperçu.
      // Compromis : si le popover n'est pas encore ouvert, on l'ouvre et on bloque la nav.
      if (!open) {
        e.preventDefault();
        setOpen(true);
        void fetchData();
      }
    },
    [open, fetchData],
  );

  const triggerContent = <span className={baseClasses}>{refItem.label}</span>;

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {internalHref ? (
        <Link href={internalHref} onClick={handleClickTrigger}>
          {triggerContent}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            void fetchData();
          }}
          className="cursor-pointer"
        >
          {triggerContent}
        </button>
      )}

      {open ? (
        <span
          role="dialog"
          aria-label={refItem.label}
          className="absolute left-1/2 top-full z-50 mt-1.5 w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-lg-navy-deep p-3 shadow-xl shadow-black/40"
        >
          {loading ? (
            <span className="block text-[11px] italic text-white/45">{t("loading")}</span>
          ) : data?.found ? (
            <span className="block space-y-1.5">
              <span className="block text-[10px] uppercase tracking-wider text-lg-gold/70">
                {data.texteTitre}
              </span>
              <span className="block text-[12px] font-semibold text-lg-gold-light">
                {t("articleHeader", { article: data.numero })}
                {data.titre ? ` — ${data.titre}` : ""}
              </span>
              <span className="block max-h-32 overflow-y-auto text-[11px] leading-relaxed text-white/75">
                {data.contenu}
              </span>
              <Link
                href={data.permalink}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] text-lg-gold/90 hover:underline"
              >
                {t("openFull")} →
              </Link>
            </span>
          ) : (
            <span className="block space-y-1.5">
              <span className="block text-[12px] text-white/75">{t("notIndexed")}</span>
              {refItem.url ? (
                <a
                  href={refItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-lg-gold/90 hover:underline"
                >
                  {t("openExternal")} <IconExternalLink size={10} />
                </a>
              ) : null}
            </span>
          )}
        </span>
      ) : null}
    </span>
  );
}
