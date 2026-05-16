import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { isValidSourceUrlSlug } from "@/lib/sources";
import {
  findTexteBySourceAndSlug,
  getVersionById,
  listVersionsForTexteSlug,
} from "@/lib/textes-service";
import { diffVersions } from "@/lib/text-diff";
import { TextDiffView } from "@/components/textes/text-diff-view";

type RouteParams = { locale: string; source: string; slug: string };
type SearchParamsT = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { source, slug } = await params;
  if (!isValidSourceUrlSlug(source)) return { title: "Comparer — LexGabon" };
  const found = await findTexteBySourceAndSlug(source, slug);
  if (!found) return { title: "Comparer — LexGabon" };
  return {
    title: `Comparer les versions — ${found.texte.titre} — LexGabon`,
    description: `Comparaison côte à côte des versions de ${found.texte.titre} sur LexGabon.`,
    robots: { index: false, follow: true },
  };
}

function pickString(raw: string | string[] | undefined): string | null {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  return null;
}

export default async function ComparerVersionsPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: SearchParamsT;
}) {
  const { locale, source, slug } = await params;
  setRequestLocale(locale);

  if (!isValidSourceUrlSlug(source)) notFound();
  const found = await findTexteBySourceAndSlug(source, slug);
  if (!found) notFound();

  const versions = await listVersionsForTexteSlug(slug);
  const t = await getTranslations("TextesCompare");

  // Pas (ou une seule) version : on affiche un message clair plutôt qu'une 404.
  if (versions.length < 2) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <BackLink locale={locale} source={source} slug={slug} label={t("backToTexte")} />
        <h1 className="mt-4 font-app-serif text-2xl font-semibold text-white">
          {t("title", { titre: found.texte.titre })}
        </h1>
        <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/65">
          {t("notEnoughVersions", { count: versions.length })}
        </p>
      </main>
    );
  }

  const raw = await searchParams;
  const requestedBefore = pickString(raw.v1);
  const requestedAfter = pickString(raw.v2);

  // Par défaut : v2 = version la plus récente, v1 = précédente.
  const afterId = requestedAfter && versions.some((v) => v.id === requestedAfter) ? requestedAfter : versions[0].id;
  const beforeId =
    requestedBefore && versions.some((v) => v.id === requestedBefore && v.id !== afterId)
      ? requestedBefore
      : versions.find((v) => v.id !== afterId)?.id ?? versions[1].id;

  const [before, after] = await Promise.all([getVersionById(beforeId), getVersionById(afterId)]);
  if (!before || !after) notFound();

  const diff = diffVersions(before.contenu, after.contenu);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
      <BackLink locale={locale} source={source} slug={slug} label={t("backToTexte")} />

      <header className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-lg-gold">
          {found.texte.reference}
        </p>
        <h1 className="font-app-serif text-2xl font-semibold leading-tight text-white">
          {t("title", { titre: found.texte.titre })}
        </h1>
      </header>

      <form
        method="get"
        className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-white/40">
            {t("versionBefore")}
          </span>
          <select
            name="v1"
            defaultValue={beforeId}
            className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-1.5 text-[13px] text-white"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} · {v.dateValidite}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-white/40">
            {t("versionAfter")}
          </span>
          <select
            name="v2"
            defaultValue={afterId}
            className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-1.5 text-[13px] text-white"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} · {v.dateValidite}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-lg-gold px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-lg-navy transition hover:bg-lg-gold-light"
          >
            {t("compare")}
          </button>
        </div>
      </form>

      <TextDiffView
        diff={diff}
        beforeLabel={`${before.label} (${before.dateValidite})`}
        afterLabel={`${after.label} (${after.dateValidite})`}
      />
    </main>
  );
}

function BackLink({
  locale,
  source,
  slug,
  label,
}: {
  locale: string;
  source: string;
  slug: string;
  label: string;
}) {
  void locale; // l10n géré par next-intl ; ce composant utilise <Link> qui préfixe la locale.
  return (
    <Link
      href={`/textes/${source}/${slug}`}
      className="inline-flex items-center gap-1 text-[12px] text-lg-gold/80 hover:text-lg-gold"
    >
      ← {label}
    </Link>
  );
}
