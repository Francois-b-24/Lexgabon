import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { IconExternalLink } from "@tabler/icons-react";
import { CORPUS_LAST_UPDATED, CORPUS_SOURCES } from "@/lib/methodologie-data";
import { getSiteUrl as siteUrl } from "@/lib/seo";

type RouteParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Methodologie" });
  const url = `${siteUrl()}/${locale}/methodologie`;
  return {
    title: `${t("title")} — LexGabon`,
    description: t("intro").slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: t("title"),
      description: t("intro").slice(0, 160),
      url,
      type: "article",
      locale,
    },
  };
}

export default async function MethodologiePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Methodologie");

  const collectionItems = t.raw("collectionItems") as string[];
  const verificationItems = t.raw("verificationItems") as string[];
  const engagementsItems = t.raw("engagementsItems") as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("title"),
    description: t("intro"),
    url: `${siteUrl()}/${locale}/methodologie`,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "LexGabon",
      url: siteUrl(),
    },
    dateModified: CORPUS_LAST_UPDATED,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-9 md:py-20">
        <h1 className="font-landing-serif text-3xl font-semibold text-lg-ink md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-lg-ink-mute">{t("intro")}</p>

        <section className="mt-12">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("principleTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-lg-ink-mute">{t("principleBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("collectionTitle")}
          </h2>
          <ol className="mt-3 space-y-2 text-[14px] leading-relaxed text-lg-ink-mute">
            {collectionItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lg-gold/20 text-[10px] font-semibold text-lg-ink">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("verificationTitle")}
          </h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-lg-ink-mute">
            {verificationItems.map((item, i) => (
              <li key={i} className="border-l border-lg-gold/35 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("frequencyTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-lg-ink-mute">{t("frequencyBody")}</p>
          <p className="mt-3 text-[12px] text-lg-ink-mute/70">
            {t("lastUpdatedLabel")} :{" "}
            <time dateTime={CORPUS_LAST_UPDATED} className="font-medium text-lg-ink">
              {CORPUS_LAST_UPDATED}
            </time>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("engagementsTitle")}
          </h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-lg-ink-mute">
            {engagementsItems.map((item, i) => (
              <li key={i} className="border-l border-lg-gold/35 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("limitsTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-lg-ink-mute">{t("limitsBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="font-landing-serif text-xl font-semibold text-lg-ink">
            {t("sourcesTitle")}
          </h2>
          <p className="mt-3 text-[13px] italic leading-relaxed text-lg-ink-mute">
            {t("sourcesIntro")}
          </p>
          <ul className="mt-5 space-y-4">
            {CORPUS_SOURCES.map((source) => (
              <li
                key={source.dbCode}
                className="rounded-lg border border-lg-ink/10 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-landing-serif text-[15px] font-semibold text-lg-ink">
                    {source.label}
                  </h3>
                  <span
                    className={
                      source.status === "indexed"
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-700"
                        : source.status === "partial"
                          ? "rounded-full bg-lg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lg-ink"
                          : "rounded-full bg-lg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lg-ink-mute"
                    }
                  >
                    {t(`sourceStatus.${source.status}`)}
                  </span>
                </div>
                <a
                  href={source.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[12px] text-lg-ink-mute hover:text-lg-ink"
                >
                  <IconExternalLink size={12} />
                  {source.portalUrl}
                </a>
                <ul className="mt-3 space-y-1 text-[13px] text-lg-ink-mute">
                  {source.texts.map((txt, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-lg-gold">·</span>
                      <span>{txt}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-lg-ink-mute/70">
                  {t("lastSyncLabel")} :{" "}
                  <time dateTime={source.lastSync}>{source.lastSync}</time>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-lg border border-lg-gold/30 bg-lg-gold/10 p-5">
          <h2 className="font-landing-serif text-lg font-semibold text-lg-ink">
            {t("contactTitle")}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-lg-ink-mute">{t("contactBody")}</p>
        </section>
      </main>
    </>
  );
}
