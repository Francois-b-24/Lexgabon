"use client";

import { IconExternalLink, IconFileText } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ChatSource } from "@/lib/chatbot-types";

export function SourceList({ sources }: { sources: ChatSource[] }) {
  const t = useTranslations("Chatbot");
  const trimmed = sources
    .filter((s) => (s.citation ?? "").trim().length > 0)
    .slice(0, 5);
  if (trimmed.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-lg-gold/70">
        {t("sourcesTitle")}
      </p>
      <ul className="flex flex-col gap-1">
        {trimmed.map((s, idx) => {
          const article = s.numero_article?.trim();
          const slug = s.slug?.trim();
          const url = s.url?.trim();
          return (
            <li
              key={idx}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/75"
            >
              <IconFileText size={14} className="shrink-0 text-lg-gold/80" />
              {article ? (
                <span className="shrink-0 rounded bg-lg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-lg-gold-light">
                  {t("sourceArticle", { article })}
                </span>
              ) : null}
              <span className="line-clamp-1 flex-1 text-white/85">{s.citation}</span>
              {slug ? (
                <Link
                  href={`/textes/${encodeURIComponent(slug)}`}
                  className="shrink-0 text-[11px] text-lg-gold/90 underline-offset-2 hover:underline"
                >
                  {t("sourceViewTexte")}
                </Link>
              ) : url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-lg-gold/90 hover:text-lg-gold-light"
                  aria-label={url}
                >
                  <IconExternalLink size={14} />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
