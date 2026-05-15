"use client";

import { IconCheck, IconCopy, IconLink, IconShare } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
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
 * Boutons d'actions sur une page texte : copier la référence normalisée,
 * partager (Web Share API + fallback presse-papier).
 */
export function TexteActions({
  reference,
  shareTitle,
  shareUrl,
}: {
  reference: string;
  shareTitle: string;
  shareUrl: string;
}) {
  const t = useTranslations("Textes");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(reference);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }, [reference]);

  const handleShare = useCallback(async () => {
    const data: ShareData = { title: shareTitle, text: shareTitle, url: shareUrl };
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
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }, [shareTitle, shareUrl]);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/80 transition hover:border-lg-gold/35 hover:text-white"
      >
        {copied ? <IconCheck size={14} className="text-emerald-300" /> : <IconCopy size={14} />}
        <span>{copied ? t("copyReferenceDone") : t("copyReference")}</span>
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/80 transition hover:border-lg-gold/35 hover:text-white"
      >
        <IconShare size={14} />
        <span>{t("share")}</span>
      </button>
    </div>
  );
}

/** Petit lien d'ancre cliquable sur chaque article (copie le permalien). */
export function ArticleAnchorButton({ permalink, ariaLabel }: { permalink: string; ariaLabel: string }) {
  const [done, setDone] = useState(false);
  const handleClick = useCallback(async () => {
    const ok = await copyToClipboard(permalink);
    if (ok) {
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    }
  }, [permalink]);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => void handleClick()}
      className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded text-white/30 transition hover:bg-white/[0.06] hover:text-lg-gold"
    >
      {done ? <IconCheck size={12} className="text-emerald-300" /> : <IconLink size={12} />}
    </button>
  );
}
