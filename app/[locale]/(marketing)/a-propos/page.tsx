import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  IconScale,
  IconLibrary,
  IconBriefcase,
  IconEye,
  IconUserCircle,
} from "@tabler/icons-react";
import { Eyebrow } from "@/components/brand/eyebrow";
import { SectionTitle } from "@/components/brand/section-title";
import { Reveal } from "@/components/animations/reveal";
import { getSiteUrl as siteUrl } from "@/lib/seo";

type RouteParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Apropos" });
  const url = `${siteUrl()}/${locale}/a-propos`;
  return {
    title: `${t("metaTitle")} | LexGabon`,
    description: t("metaDescription"),
    alternates: { canonical: url },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url,
      type: "article",
      locale,
    },
  };
}

export default async function AproposPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Apropos");

  const teamMembers = [
    { nameKey: "member1Name", roleKey: "member1Role", bioKey: "member1Bio" },
    { nameKey: "member2Name", roleKey: "member2Role", bioKey: "member2Bio" },
  ] as const;

  const missions = [
    { Icon: IconScale, titleKey: "mission1Title", bodyKey: "mission1Body" },
    { Icon: IconLibrary, titleKey: "mission2Title", bodyKey: "mission2Body" },
    { Icon: IconBriefcase, titleKey: "mission3Title", bodyKey: "mission3Body" },
    { Icon: IconEye, titleKey: "mission4Title", bodyKey: "mission4Body" },
  ] as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("title"),
    description: t("objectifBody"),
    url: `${siteUrl()}/${locale}/a-propos`,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "LexGabon",
      url: siteUrl(),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-lg-navy px-6 py-20 text-lg-paper md:px-9 md:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Eyebrow>{t("objectifEyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-landing-serif text-[clamp(34px,4.5vw,60px)] font-normal leading-[1.08] tracking-[-0.02em] text-lg-paper">
              {t("objectifTitle")}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-7 max-w-[60ch] text-[15px] font-light leading-relaxed text-white/75">
              {t("objectifBody")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-lg-paper px-6 py-20 md:px-9 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>{t("equipeEyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <SectionTitle className="mb-6">{t("equipeTitle")}</SectionTitle>
          </Reveal>
          <Reveal delay={140}>
            <p className="mb-12 max-w-[60ch] text-[14px] font-light leading-relaxed text-lg-ink-mute">
              {t("equipeIntro")}
            </p>
          </Reveal>
          <div className="grid gap-px border border-[var(--lg-rule)] bg-[var(--lg-rule)] sm:grid-cols-2">
            {teamMembers.map((member, i) => (
              <Reveal key={member.nameKey} delay={i * 80}>
                <article className="flex h-full flex-col bg-lg-paper p-8 text-left transition-colors hover:bg-lg-paper-warm md:p-10">
                  <div className="mb-5 grid h-24 w-24 place-items-center rounded-full border border-lg-gold/40 bg-lg-navy/5 text-lg-steel">
                    <IconUserCircle size={56} stroke={1.2} aria-hidden />
                  </div>
                  <h3 className="font-landing-serif text-[20px] font-medium text-lg-ink">
                    {t(member.nameKey)}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-lg-gold">
                    {t(member.roleKey)}
                  </p>
                  <p className="mt-4 text-[13px] font-light leading-relaxed text-lg-ink-mute">
                    {t(member.bioKey)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-lg-paper-warm px-6 py-20 md:px-9 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Eyebrow>{t("missionsEyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <SectionTitle className="mb-12">{t("missionsTitle")}</SectionTitle>
          </Reveal>
          <div className="grid gap-px border border-[var(--lg-rule)] bg-[var(--lg-rule)] sm:grid-cols-2">
            {missions.map(({ Icon, titleKey, bodyKey }, i) => (
              <Reveal key={titleKey} delay={i * 80}>
                <article className="flex h-full gap-5 bg-lg-paper p-8 md:p-10">
                  <div className="grid h-12 w-12 shrink-0 place-items-center border border-lg-gold text-lg-gold">
                    <Icon size={24} stroke={1.4} aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-landing-serif text-[20px] font-medium text-lg-ink">
                      {t(titleKey)}
                    </h3>
                    <p className="mt-2 text-[13px] font-light leading-relaxed text-lg-ink-mute">
                      {t(bodyKey)}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
