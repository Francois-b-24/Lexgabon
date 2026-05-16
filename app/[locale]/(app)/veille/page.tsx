import type { Metadata } from "next";
import { setRequestLocale, getTranslations, getLocale } from "next-intl/server";
import {
  IconBellRinging,
  IconExternalLink,
  IconRss,
  IconSearch,
} from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { listVeilleItems, parseVeilleQuery, VEILLE_FILTER_OPTIONS } from "@/lib/veille-service";
import type { VeilleQuery } from "@/lib/veille-service";
import { VeilleGrid } from "@/components/veille/veille-grid";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Veille — LexGabon",
  description:
    "Flux dynamique des publications officielles suivies par LexGabon : Journal officiel du Gabon, OHADA, CEMAC, COBAC, CIMA.",
};

type Portal = { name: string; url: string };
const OFFICIAL_PORTALS: Portal[] = [
  { name: "Journal officiel du Gabon", url: "https://journal-officiel.ga/" },
  { name: "OHADA", url: "https://www.ohada.org/" },
  { name: "BEAC", url: "https://www.beac.int/" },
  { name: "COBAC (via BEAC)", url: "https://www.beac.int/supervision-bancaire/reglements-de-cobac" },
  { name: "CEMAC", url: "https://cemac.int/" },
];

const SOURCE_LABEL_FR: Record<string, string> = {
  "jo-ga": "Gabon",
  ohada: "OHADA",
  cemac: "CEMAC",
  cobac: "COBAC",
  cima: "CIMA",
};

function toSearchParamsObj(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((vv) => out.append(k, vv));
    else out.append(k, v);
  }
  return out;
}

function buildHref(query: VeilleQuery, override: Partial<{ source: string; q: string }>): string {
  const sp = new URLSearchParams();
  const sources =
    "source" in override
      ? override.source
        ? [override.source]
        : []
      : query.sources;
  sources.forEach((s) => sp.append("source", s));
  query.domaines.forEach((d) => sp.append("domaine", d));
  const q = override.q !== undefined ? override.q : query.q;
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/veille?${qs}` : "/veille";
}

export default async function VeillePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Veille");
  const localeNow = await getLocale();
  const raw = await searchParams;
  const query = parseVeilleQuery(toSearchParamsObj(raw));
  const { items, degraded } = await listVeilleItems(query);

  const newCount = items.filter((i) => i.estNouveau).length;
  const allOption = query.sources.length === 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-lg-app-navy px-5 py-3.5">
        <form
          method="get"
          action="/veille"
          className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus-within:border-lg-gold/40"
        >
          <IconSearch size={14} className="text-white/25" />
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            maxLength={128}
          />
          {query.sources.map((s) => (
            <input key={s} type="hidden" name="source" value={s} />
          ))}
        </form>
        <p className="hidden shrink-0 items-center gap-1.5 text-[11px] text-white/25 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {t("updated")} ·{" "}
          {new Date().toLocaleDateString(localeNow === "en" ? "en-GB" : "fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <a
          href={`/${locale}/veille/rss.xml`}
          className="hidden shrink-0 items-center gap-1.5 rounded-md border border-lg-gold/30 px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-lg-gold-light hover:bg-lg-gold/10 sm:flex"
          aria-label={t("rssLink")}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconRss size={12} />
          {t("rssLabel")}
        </a>
      </header>

      {newCount > 0 ? (
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg border border-lg-gold/25 bg-lg-gold/10 px-3.5 py-2.5">
          <IconBellRinging size={16} className="text-lg-gold" />
          <p className="text-xs text-lg-gold-light">
            <strong>{t("alertIntro", { count: newCount })}</strong> {t("alertOutro")}
          </p>
        </div>
      ) : null}

      <div className="flex-1 space-y-4 p-3.5 sm:p-5">
        <section className="rounded-[11px] border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-app-serif text-sm font-semibold text-lg-gold-light">
            {t("officialPortalsTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-[11px] font-light leading-relaxed text-white/55">
            {t("officialPortalsIntro")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {OFFICIAL_PORTALS.map((p) => (
              <li key={p.url}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white/80 transition hover:border-lg-gold/35 hover:text-white"
                >
                  <IconExternalLink size={12} className="text-lg-gold/80" />
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/35">
            {t("filterBySource")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={buildHref(query, { source: "" })}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                allOption
                  ? "bg-lg-gold text-lg-navy"
                  : "border border-white/15 bg-white/5 text-white/60 hover:border-lg-gold/30 hover:text-white",
              )}
            >
              {t("filterAll")}
            </Link>
            {VEILLE_FILTER_OPTIONS.sources.map((s) => {
              const active = query.sources.length === 1 && query.sources[0] === s;
              return (
                <Link
                  key={s}
                  href={buildHref(query, { source: s })}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                    active
                      ? "bg-lg-gold text-lg-navy"
                      : "border border-white/15 bg-white/5 text-white/60 hover:border-lg-gold/30 hover:text-white",
                  )}
                >
                  {SOURCE_LABEL_FR[s] ?? s}
                </Link>
              );
            })}
          </div>
        </div>

        {degraded ? (
          <p className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/85">
            {t("degradedNotice")}
          </p>
        ) : null}

        <VeilleGrid items={items} />

        <p className="mx-auto max-w-3xl text-center text-[10px] leading-relaxed text-white/35">
          {t("curatedFootnote")}
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] leading-relaxed text-white/30">
          {t("sourceOpenHint")}
        </p>
      </div>
    </div>
  );
}
