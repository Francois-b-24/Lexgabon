"use client";

import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mockVeille } from "@/lib/mock/veille";

type Hit = { slug: string; titre: string; resume: string; source: string };

export default function RecherchePage() {
  const t = useTranslations("Recherche");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    async function run() {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { hits: Hit[] };
        if (ctrl.signal.aborted) return;
        setHits(data.hits ?? []);
      } catch (err) {
        const aborted =
          (err instanceof DOMException && err.name === "AbortError") ||
          (err instanceof Error && err.name === "AbortError");
        if (aborted) return;
        setHits([]);
      }
    }
    void run();
    return () => ctrl.abort();
  }, [q]);

  const fallback = mockVeille.map((m) => ({
    slug: m.slug,
    titre: m.titre,
    resume: m.resume,
    source: m.source,
  }));

  const list = hits.length || q ? hits : fallback;

  return (
    <div className="flex min-h-screen flex-col p-5">
      <h1 className="font-app-serif text-xl font-semibold text-white">{t("title")}</h1>
      <div className="mt-4 flex max-w-xl items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <IconSearch size={16} className="text-white/25" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
          placeholder={t("searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <ul className="mt-6 space-y-3">
        {list.map((h) => (
          <li key={h.slug}>
            <Link href={`/textes/${h.slug}`} className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:border-lg-gold/25">
              <span className="text-[10px] uppercase text-lg-gold">{h.source}</span>
              <p className="font-app-serif text-sm font-medium text-white">{h.titre}</p>
              <p className="mt-1 text-xs text-white/45">{h.resume}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
