import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IconExternalLink } from "@tabler/icons-react";
import { findTexteBySourceAndSlug, listVersionsForTexteSlug } from "@/lib/textes-service";
import { isValidSourceUrlSlug, sourceLabelFr } from "@/lib/sources";
import { getSiteUrl as siteUrl } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import {
  TexteActions,
  ArticleAnchorButton,
  ArticleCitationButton,
} from "@/components/textes/texte-actions";
import { buildArticleCitation } from "@/lib/article-citation";

type RouteParams = { locale: string; source: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { locale, source, slug } = await params;
  if (!isValidSourceUrlSlug(source)) return { title: "LexGabon" };

  const found = await findTexteBySourceAndSlug(source, slug);
  if (!found) return { title: "LexGabon" };

  const { texte } = found;
  const url = `${siteUrl()}/${locale}/textes/${source}/${slug}`;
  const description = (texte.resume || `${texte.titre} — ${texte.reference}`).slice(0, 160);

  return {
    title: `${texte.titre} — LexGabon`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: texte.titre,
      description,
      url,
      type: "article",
      locale,
    },
    twitter: {
      card: "summary",
      title: texte.titre,
      description,
    },
  };
}

export default async function TexteSourceDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, source, slug } = await params;
  setRequestLocale(locale);

  if (!isValidSourceUrlSlug(source)) notFound();

  const found = await findTexteBySourceAndSlug(source, slug);
  if (!found) notFound();

  const { texte, articles } = found;
  const t = await getTranslations("Textes");
  const versions = await listVersionsForTexteSlug(slug);
  const hasMultipleVersions = versions.length >= 2;

  const canonicalUrl = `${siteUrl()}/${locale}/textes/${source}/${slug}`;
  const sourceLabel = sourceLabelFr(source);

  // JSON-LD schema.org/Legislation
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: texte.titre,
    legislationIdentifier: texte.reference,
    legislationDate: texte.datePublication,
    legislationDateOfApplicability: texte.dateEntreeVig || undefined,
    legislationLegalForce: texte.estEnVigueur ? "InForce" : "Repealed",
    legislationJurisdiction: source === "jo-ga" ? "Gabon" : sourceLabel,
    url: canonicalUrl,
    description: texte.resume || undefined,
    isBasedOn: texte.urlSource,
    sameAs: texte.urlSource,
    inLanguage: "fr",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 md:px-9 md:py-10 lg:grid-cols-[300px_1fr]">
        <aside className="top-24 h-fit space-y-5 rounded-lg border border-white/10 bg-white/[0.03] p-5 lg:sticky">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-lg-gold">{texte.reference}</p>
            <h1 className="font-app-serif text-lg font-semibold leading-tight text-white">
              {texte.titre}
            </h1>
          </div>

          <dl className="grid gap-2 text-[11px] text-white/55">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/40">{t("metaPublication")}</dt>
              <dd className="text-right text-white/80">{texte.datePublication}</dd>
            </div>
            {texte.dateEntreeVig ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-white/40">{t("metaEntreeVig")}</dt>
                <dd className="text-right text-white/80">{texte.dateEntreeVig}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/40">{t("metaType")}</dt>
              <dd className="text-right text-white/80">{texte.type}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/40">{t("metaSource")}</dt>
              <dd className="text-right text-white/80">{sourceLabel}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-white/40">{t("metaStatus")}</dt>
              <dd
                className={
                  texte.estEnVigueur
                    ? "text-right text-emerald-300/90"
                    : "text-right text-amber-200/90"
                }
              >
                {texte.estEnVigueur ? t("statusInForce") : t("statusRepealed")}
              </dd>
            </div>
          </dl>

          <a
            href={texte.urlSource}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-md bg-lg-gold px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-lg-navy transition hover:bg-lg-gold-light"
          >
            <IconExternalLink size={14} />
            {t("openSource")}
          </a>

          <TexteActions reference={texte.reference} shareTitle={texte.titre} shareUrl={canonicalUrl} />

          {hasMultipleVersions ? (
            <Link
              href={`/textes/${source}/${slug}/comparer`}
              className="flex items-center justify-center gap-1.5 rounded-md border border-lg-gold/30 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-lg-gold-light transition hover:bg-lg-gold/10"
            >
              {t("compareVersions", { count: versions.length })}
            </Link>
          ) : null}

          {articles.length > 0 ? (
            <nav aria-label={t("tableOfContents")} className="border-t border-white/10 pt-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-lg-gold/70">
                {t("tableOfContents")}
              </p>
              <ol className="space-y-1 text-[12px] text-white/65">
                {articles.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`#article-${a.numero}`}
                      className="block py-0.5 transition hover:text-lg-gold"
                    >
                      <span className="mr-1.5 text-white/35">Article {a.numero}</span>
                      {a.titre ? <span className="text-white/55">— {a.titre}</span> : null}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>

        <article className="min-w-0">
          {texte.resume ? (
            <p className="mb-8 max-w-3xl text-[14px] leading-relaxed text-white/60">{texte.resume}</p>
          ) : null}

          {articles.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-6 text-[13px] text-white/55">
              {t("noArticlesIndexed")}
            </p>
          ) : (
            <div className="max-w-3xl space-y-10">
              {articles.map((a, idx) => {
                const showSection =
                  a.titreSection &&
                  (idx === 0 || articles[idx - 1].titreSection !== a.titreSection);
                const anchorId = `article-${a.numero}`;
                const permalink = `${canonicalUrl}#${anchorId}`;
                return (
                  <section key={a.id} id={anchorId} className="scroll-mt-24">
                    {showSection ? (
                      <p className="mb-3 text-[10px] uppercase tracking-wider text-lg-gold/60">
                        {t("section")} — {a.titreSection}
                      </p>
                    ) : null}
                    <div className="flex items-start gap-1">
                      <h2 className="font-app-serif text-[16px] font-semibold leading-snug text-lg-gold-light">
                        Article {a.numero}
                        {a.titre ? <span className="font-normal text-white/75"> — {a.titre}</span> : null}
                      </h2>
                      <ArticleAnchorButton permalink={permalink} ariaLabel={t("articleAnchorLabel")} />
                      <ArticleCitationButton
                        citation={buildArticleCitation(a.numero, texte.titre, texte.reference)}
                        ariaLabel={t("articleCitationLabel")}
                      />
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-white/85">
                      {a.contenu}
                    </p>
                  </section>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </>
  );
}
