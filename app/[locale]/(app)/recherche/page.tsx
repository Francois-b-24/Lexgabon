import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  SOURCE_FILTER_OPTIONS,
  SUPPORTED_DOMAINES,
  SUPPORTED_TYPES,
  parseSearchFilters,
  runSearch,
} from "@/lib/search-service";
import type { SearchFilters } from "@/lib/search-types";
import { ClearFiltersButton } from "@/components/recherche/clear-filters-button";
import { FiltersForm } from "@/components/recherche/filters-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recherche — LexGabon",
  description:
    "Recherche full-text et sémantique dans le corpus juridique gabonais : JO, OHADA, CEMAC, COBAC.",
};

type RouteParams = { locale: string };
type Search = { searchParams: Promise<Record<string, string | string[] | undefined>> };

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

function buildPageUrl(filters: SearchFilters, page: number): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.mode !== "fulltext") sp.set("mode", filters.mode);
  filters.sources.forEach((s) => sp.append("source", s));
  filters.types.forEach((t) => sp.append("type", t));
  filters.domaines.forEach((d) => sp.append("domaine", d));
  if (filters.dateFrom) sp.set("date_from", filters.dateFrom);
  if (filters.dateTo) sp.set("date_to", filters.dateTo);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/recherche?${qs}` : "/recherche";
}

export default async function RechercheSSRPage({
  params,
  searchParams,
}: { params: Promise<RouteParams> } & Search) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  const filters = parseSearchFilters(toSearchParamsObj(raw));
  const response = await runSearch(filters);
  const t = await getTranslations("Recherche");

  const totalPages = Math.max(1, Math.ceil(response.total / filters.pageSize));
  const hasResults = response.hits.length > 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <h1 className="font-app-serif text-xl font-semibold text-white">{t("title")}</h1>

      <FiltersForm>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 focus-within:border-lg-gold/40">
            <input
              type="search"
              name="q"
              defaultValue={filters.q}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/30"
              maxLength={256}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-md bg-lg-gold px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-lg-navy transition hover:bg-lg-gold-light"
          >
            {t("submit")}
          </button>
        </div>

        <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/65">
          <legend className="sr-only">{t("mode")}</legend>
          <span className="text-[10px] uppercase tracking-wider text-white/35">{t("mode")}</span>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name="mode"
              value="fulltext"
              defaultChecked={filters.mode === "fulltext"}
              className="accent-lg-gold"
            />
            <span>{t("modeFulltext")}</span>
          </label>
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name="mode"
              value="semantic"
              defaultChecked={filters.mode === "semantic"}
              className="accent-lg-gold"
            />
            <span>{t("modeSemantic")}</span>
          </label>
          {filters.mode === "semantic" ? (
            <span className="text-[10px] italic text-white/40">{t("modeSemanticHint")}</span>
          ) : null}
        </fieldset>

        <details className="rounded-md border border-white/10" open>
          <summary className="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wider text-lg-gold/80">
            {t("filters")}
          </summary>
          <div className="grid gap-4 px-3 pb-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            <FilterCheckboxes
              label={t("filterSource")}
              name="source"
              options={SOURCE_FILTER_OPTIONS.map((s) => ({ value: s, label: t(`sourceOption.${s}`) }))}
              selected={filters.sources}
              counts={response.facets?.source ?? null}
            />
            <FilterCheckboxes
              label={t("filterType")}
              name="type"
              options={SUPPORTED_TYPES.map((s) => ({ value: s, label: t(`typeOption.${s}`) }))}
              selected={filters.types}
              counts={response.facets?.type ?? null}
            />
            <FilterCheckboxes
              label={t("filterDomaine")}
              name="domaine"
              options={SUPPORTED_DOMAINES.map((s) => ({ value: s, label: t(`domaineOption.${s}`) }))}
              selected={filters.domaines}
              counts={response.facets?.domaine ?? null}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-white/35" htmlFor="date_from">
                {t("filterDateFrom")}
              </label>
              <input
                id="date_from"
                name="date_from"
                type="date"
                defaultValue={filters.dateFrom ?? ""}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[12px] text-white outline-none focus:border-lg-gold/40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider text-white/35" htmlFor="date_to">
                {t("filterDateTo")}
              </label>
              <input
                id="date_to"
                name="date_to"
                type="date"
                defaultValue={filters.dateTo ?? ""}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[12px] text-white outline-none focus:border-lg-gold/40"
              />
            </div>
          </div>
        </details>

        {hasActiveFilters(filters) ? (
          <div className="flex items-center gap-3">
            <ClearFiltersButton />
          </div>
        ) : null}
      </FiltersForm>

      <div className="flex items-baseline justify-between text-[11px] text-white/45">
        <p>{t("totalResults", { total: response.total })}</p>
        {totalPages > 1 ? <p>{t("page", { page: filters.page, total: totalPages })}</p> : null}
      </div>

      {response.degraded ? (
        <p className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/85">
          {t("degradedNotice")}
        </p>
      ) : null}

      {!hasResults ? (
        <p className="py-8 text-center text-[13px] text-white/45">{t("noResults")}</p>
      ) : (
        <ul className="space-y-3">
          {response.hits.map((hit, idx) => {
            const href =
              hit.slug && hit.source
                ? `/textes/${hit.source}/${encodeURIComponent(hit.slug)}${
                    hit.articleNumero ? `#article-${hit.articleNumero}` : ""
                  }`
                : null;
            const card = (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-lg-gold/25">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
                  {hit.source ? (
                    <span className="rounded bg-lg-gold/15 px-2 py-0.5 text-lg-gold-light">
                      {t(`sourceOption.${hit.source}`)}
                    </span>
                  ) : null}
                  {hit.type ? (
                    <span className="text-white/45">{hit.type}</span>
                  ) : null}
                  {hit.articleNumero ? (
                    <span className="text-white/60">
                      {t("matchedArticle", { article: hit.articleNumero })}
                    </span>
                  ) : null}
                  {hit.datePublication ? (
                    <span className="ml-auto text-white/35">{hit.datePublication}</span>
                  ) : null}
                </div>
                <h2 className="mt-2 font-app-serif text-[15px] font-semibold leading-snug text-white">
                  {hit.titre}
                </h2>
                {hit.reference ? (
                  <p className="mt-0.5 text-[11px] italic text-white/45">{hit.reference}</p>
                ) : null}
                {hit.resume ? (
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/65">
                    {hit.resume}
                  </p>
                ) : null}
              </div>
            );
            return (
              <li key={`${hit.slug}-${hit.articleNumero ?? idx}`}>
                {href ? (
                  <Link href={href} className="block">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between text-[12px] text-white/65">
          {filters.page > 1 ? (
            <Link href={buildPageUrl(filters, filters.page - 1)} className="hover:text-lg-gold">
              ← {t("previous")}
            </Link>
          ) : (
            <span />
          )}
          {filters.page < totalPages ? (
            <Link href={buildPageUrl(filters, filters.page + 1)} className="hover:text-lg-gold">
              {t("next")} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}

function hasActiveFilters(f: SearchFilters): boolean {
  return (
    f.sources.length > 0 ||
    f.types.length > 0 ||
    f.domaines.length > 0 ||
    !!f.dateFrom ||
    !!f.dateTo
  );
}

function FilterCheckboxes({
  label,
  name,
  options,
  selected,
  counts,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
  counts: Record<string, number> | null;
}) {
  // Tri par pertinence quand on a les compteurs : les options avec le plus de
  // résultats apparaissent en premier, les ex aequo restent dans l'ordre du tableau
  // source (qui est l'ordre d'écriture dans `SUPPORTED_DOMAINES` / `SUPPORTED_TYPES`).
  // Cocher une option la fait remonter en tête pour qu'elle reste visible.
  const sortedOptions = counts
    ? [...options].sort((a, b) => {
        const aSel = selected.includes(a.value) ? 1 : 0;
        const bSel = selected.includes(b.value) ? 1 : 0;
        if (aSel !== bSel) return bSel - aSel;
        return (counts[b.value] ?? 0) - (counts[a.value] ?? 0);
      })
    : options;
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-[10px] uppercase tracking-wider text-white/35">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {sortedOptions.map((opt) => {
          const checked = selected.includes(opt.value);
          const count = counts ? (counts[opt.value] ?? 0) : null;
          // Trois états visuels :
          // - checked : option active (filtre sélectionné par l'utilisateur)
          // - highlighted : présente dans les résultats courants → surbrillance dorée
          //   discrète pour signaler "tu peux affiner par là" (cliquable normalement)
          // - empty : aucun résultat → grisée et désactivée
          // - default : pas de signal particulier
          const isEmpty = count === 0 && !checked;
          const isHighlighted = !checked && count !== null && count > 0;
          return (
            <label
              key={opt.value}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
                checked
                  ? "border-lg-gold/60 bg-lg-gold/15 text-lg-gold-light"
                  : isHighlighted
                  ? "border-lg-gold/40 bg-lg-gold/[0.08] text-lg-gold-light/90 hover:border-lg-gold/60 hover:bg-lg-gold/15"
                  : isEmpty
                  ? "border-white/5 bg-white/[0.02] text-white/25 cursor-not-allowed"
                  : "border-white/10 bg-white/[0.03] text-white/65 hover:border-lg-gold/30 hover:text-white"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                defaultChecked={checked}
                disabled={isEmpty}
                className="sr-only"
              />
              <span>{opt.label}</span>
              {count !== null && count > 0 ? (
                <span className="text-[10px] opacity-60">({count})</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
