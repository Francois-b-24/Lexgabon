import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLandingStats, type LandingStats } from "@/lib/landing-stats";
import { OFFICIAL_LANDING_SOURCES } from "@/lib/official-sources";
import { Eyebrow } from "@/components/brand/eyebrow";
import { SectionTitle } from "@/components/brand/section-title";
import { Reveal } from "@/components/animations/reveal";
import { SplitText } from "@/components/animations/split-text";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { CustomCursor } from "@/components/animations/custom-cursor";
import { Marquee } from "@/components/animations/marquee";
import { GabonMap } from "@/components/landing/gabon-map";

/** Affichage marketing : volume indexé annoncé sur la landing (hors agrégation temps réel). */
const LANDING_INDEXED_DISPLAY = "2500+";

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const n = await getTranslations("Nav");
  const locale = await getLocale();

  let stats: LandingStats;
  try {
    stats = await getLandingStats(locale);
  } catch (e) {
    console.error("[landing] stats", e);
    stats = {
      officialSourcesCount: OFFICIAL_LANDING_SOURCES.length,
      lastUpdatePrimary: "—",
      lastUpdateSecondary: "curated",
    };
  }

  return (
    <>
      <CustomCursor />

      <section className="relative overflow-hidden bg-lg-navy pb-16 pl-6 pr-6 pt-[4.5rem] text-lg-paper md:px-9 md:pb-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-45 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_65%_30%,rgba(41,82,112,0.45),transparent_60%)]"
          aria-hidden
        />
        <div className="relative z-[2] mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[680px] flex-1">
            <Reveal>
              <Eyebrow>{t("heroEyebrow")}</Eyebrow>
            </Reveal>
            <h1 className="font-landing-serif text-[clamp(42px,5.5vw,78px)] font-normal leading-[1.06] tracking-[-0.02em] text-lg-paper">
              <Reveal delay={80}>
                <span className="block">
                  <SplitText text={`${t("heroTitle1")} ${t("heroTitle2")}`} />
                </span>
              </Reveal>
              <Reveal delay={160}>
                <span className="block">
                  <em className="text-lg-gold not-italic">{t("heroTitleEm")}</em>
                </span>
              </Reveal>
            </h1>
            <Reveal delay={240}>
              <p className="mt-7 max-w-[54ch] text-[15px] font-light leading-relaxed text-white/70">
                {t("heroSub")}
              </p>
            </Reveal>
            <Reveal delay={320} className="mt-10 flex flex-wrap gap-3.5">
              <MagneticButton>
                <a
                  href="https://alin-africa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex bg-lg-gold px-6 py-3.5 font-landing-sans text-xs font-semibold uppercase tracking-[0.12em] text-lg-navy"
                >
                  {t("ctaPrimary")} →
                </a>
              </MagneticButton>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-14 grid gap-6 border-t border-[rgba(196,154,42,0.22)] pt-7 sm:grid-cols-3">
                <div>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-lg-gold">
                    {t("metaIndexed")}
                  </span>
                  <span className="font-landing-serif text-[26px] text-lg-paper">
                    {LANDING_INDEXED_DISPLAY}
                  </span>
                </div>
                <div>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-lg-gold">
                    {t("metaSources")}
                  </span>
                  <span className="font-landing-serif text-[26px] text-lg-paper">
                    {stats.officialSourcesCount}
                  </span>
                </div>
                <div>
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-lg-gold">
                    {t("metaAccess")}
                  </span>
                  <span className="font-landing-serif text-[26px] text-lg-paper">
                    {t("metaAccessFree")}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal className="hidden shrink-0 lg:block" delay={200}>
            <GabonMap />
          </Reveal>
        </div>
      </section>

      <Marquee text={t("marquee")} />

      <section id="textes" className="bg-lg-paper px-6 py-20 md:px-9 md:py-24">
        <Reveal>
          <Eyebrow>{t("valueEyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <SectionTitle className="mb-12">
            <>
              {t("valueTitle1")}
              <br />
              <em>{t("valueTitleEm")}</em>
            </>
          </SectionTitle>
        </Reveal>
        <div className="grid gap-px border border-[var(--lg-rule)] bg-[var(--lg-rule)] md:grid-cols-3">
          {[
            {
              title: "Droit gabonais",
              body: "Textes législatifs et réglementaires publiés au Journal Officiel — lois, ordonnances, décrets.",
              tags: ["Lois", "Ordonnances", "Journal Officiel"],
            },
            {
              title: "OHADA & CEMAC",
              body: "Actes uniformes OHADA, règlements CEMAC et circulaires COBAC applicables au Gabon.",
              tags: ["OHADA", "CEMAC", "COBAC"],
            },
            {
              title: "Assistant Ama'IA",
              body: "Posez vos questions en français. Ama'IA répond en citant les textes officiels applicables.",
              tags: ["IA juridique", "Sources citées", "Vérifiez les réponses"],
            },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <div className="h-full bg-lg-paper p-8 transition-colors hover:bg-lg-paper-warm md:p-10">
                <h3 className="font-landing-serif text-[26px] font-medium text-lg-ink">
                  {card.title}
                </h3>
                <p className="mt-3 text-[13px] font-light leading-relaxed text-lg-ink-mute">
                  {card.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[var(--lg-rule)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-lg-steel"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-lg-navy px-6 py-20 text-lg-paper md:px-9 md:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(41,82,112,0.45),transparent_60%)]"
          aria-hidden
        />
        <div className="relative z-[2]">
          <Reveal>
            <Eyebrow>{t("statsEyebrow")}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-landing-serif text-[clamp(30px,3.8vw,50px)] font-normal text-lg-paper">
              {t("statsTitle1")}
              <br />
              <em className="text-lg-gold not-italic">{t("statsTitleEm")}</em>
            </h2>
          </Reveal>
          <div className="mt-12 grid border-y border-[var(--lg-gold-faint)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              [LANDING_INDEXED_DISPLAY, t("metaIndexed")],
              [String(stats.officialSourcesCount), t("metaSources")],
              [
                stats.lastUpdatePrimary === "—" && stats.lastUpdateSecondary === "curated"
                  ? t("statsCuratedShort")
                  : stats.lastUpdatePrimary,
                stats.lastUpdateSecondary === "curated"
                  ? t("statsCuratedCaption")
                  : t("statsLastUpdateCaption"),
              ],
              [t("metaAccessFree"), t("metaAccess")],
            ].map(([num, label], i) => (
              <Reveal key={String(label)} delay={i * 80}>
                <div className="border-b border-[var(--lg-gold-faint)] p-6 sm:border-r sm:border-b-0 sm:last:border-r-0 lg:border-r">
                  <span className="font-landing-serif text-[clamp(40px,4.5vw,64px)] text-lg-gold">
                    {num}
                  </span>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/60">
                    {label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sources" className="bg-lg-paper-warm px-6 py-20 md:px-9 md:py-24">
        <Reveal>
          <Eyebrow>{t("sourcesEyebrow")}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <SectionTitle className="mb-10">
            <>
              {t("sourcesTitle1")} <em>{t("sourcesTitleEm")}</em>
            </>
          </SectionTitle>
        </Reveal>
        <div className="grid gap-px border border-[var(--lg-rule)] bg-[var(--lg-rule)] sm:grid-cols-2 lg:grid-cols-5">
          {OFFICIAL_LANDING_SOURCES.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <div className="flex h-full flex-col items-center bg-lg-paper px-4 py-10 text-center transition-colors hover:bg-lg-paper-warm">
                <div className="mb-4 grid h-14 w-14 place-items-center border border-lg-gold">
                  <span className="text-lg-gold">◇</span>
                </div>
                <p className="font-landing-serif text-lg font-medium text-lg-navy">{s.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-lg-ink-mute">
                  {s.desc}
                </p>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[10px] text-lg-gold underline decoration-[var(--lg-rule)]"
                >
                  {s.href.replace("https://", "")} ↗
                </a>
                <span className="mt-2 text-[9px] uppercase italic tracking-[0.1em] text-lg-ink-mute/55">
                  {s.scope}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="about" className="bg-lg-paper px-6 py-20 md:px-9 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <div className="relative mx-auto aspect-square max-w-[300px] overflow-hidden bg-lg-navy">
              <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center p-7 text-center">
                <div className="mb-4 grid h-20 w-20 place-items-center border border-lg-gold font-logo text-[38px] font-bold text-lg-gold">
                  A
                </div>
                <div className="font-logo text-[22px] font-bold tracking-[2px] text-lg-paper">
                  ALIN
                </div>
                <div className="mt-2 h-0.5 w-4/5 bg-lg-gold" />
                <span className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[#9bb0c8]">
                  African Legal Innovation Network
                </span>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>{t("alinEyebrow")}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-landing-serif text-[clamp(26px,3.2vw,44px)] font-normal text-lg-ink">
                {t("alinTitle1")}
                <br />
                <em className="text-lg-steel not-italic">{t("alinTitleEm")}</em>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-[54ch] text-sm font-light leading-relaxed text-lg-ink-mute">
                LexGabon est développé par l&apos;
                <strong className="font-medium text-lg-ink">
                  African Legal Innovation Network
                </strong>
                , réseau panafricain dédié à l&apos;innovation juridique.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <a
                href="https://alin-africa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 border-b border-lg-gold pb-1 text-xs uppercase tracking-[0.14em] text-lg-navy"
              >
                Découvrir ALIN → alin-africa.com
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <footer id="api" className="relative overflow-hidden bg-lg-navy-deep px-6 pb-8 pt-16 text-lg-paper md:px-9">
        <div className="relative z-[2] mx-auto max-w-6xl">
          <div className="grid gap-10 border-b border-[var(--lg-gold-faint)] pb-11 md:grid-cols-4">
            <div>
              <div className="font-logo text-xl font-bold tracking-[2px]">
                <span className="text-[#EDE9E0]">Lex</span>
                <span className="text-lg-gold">Gabon</span>
              </div>
              <div className="mt-1 h-0.5 w-[100px] bg-lg-gold" />
              <p className="mt-3 max-w-[30ch] text-xs font-light leading-relaxed text-white/50">
                Plateforme de données juridiques ouvertes pour la République Gabonaise.
              </p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-lg-gold">
                Une initiative ALIN · alin-africa.com
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-lg-gold">
                {t("footerPlatform")}
              </h4>
              <ul className="space-y-2 text-sm font-light text-white/60">
                <li>
                  <Link href="/recherche" className="hover:text-lg-gold">
                    {n("recherche")}
                  </Link>
                </li>
                <li>
                  <Link href="/#textes" className="hover:text-lg-gold">
                    {n("textes")}
                  </Link>
                </li>
                <li>
                  <Link href="/veille" className="hover:text-lg-gold">
                    {n("veille")}
                  </Link>
                </li>
                <li>
                  <Link href="/chatbot" className="hover:text-lg-gold">
                    {n("chatbot")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-lg-gold">
                {t("footerSources")}
              </h4>
              <ul className="space-y-2 text-sm font-light text-white/60">
                <li>
                  <a href="https://journal-officiel.ga" className="hover:text-lg-gold" target="_blank" rel="noopener noreferrer">
                    Journal Officiel · Gabon
                  </a>
                </li>
                <li>
                  <a href="https://ohada.org" className="hover:text-lg-gold" target="_blank" rel="noopener noreferrer">
                    OHADA
                  </a>
                </li>
                <li>
                  <a href="https://cemac.int" className="hover:text-lg-gold" target="_blank" rel="noopener noreferrer">
                    CEMAC
                  </a>
                </li>
                <li>
                  <a href="https://beac.int" className="hover:text-lg-gold" target="_blank" rel="noopener noreferrer">
                    COBAC
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-lg-gold">
                {t("footerAlin")}
              </h4>
              <ul className="space-y-2 text-sm font-light text-white/60">
                <li>
                  <a href="https://alin-africa.com" target="_blank" rel="noopener noreferrer" className="hover:text-lg-gold">
                    À propos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-[11px] text-white/30">
            © 2026 LexGabon · par ALIN · Libreville, Gabon ·{" "}
            <Link href="/mentions-legales" className="hover:text-white/50">
              {t("footerLegal")}
            </Link>
            <span className="mx-2">·</span>
            <Link href="/cgu" className="hover:text-white/50">
              CGU
            </Link>
            <span className="mx-2">·</span>
            <span>{t("legalNote")}</span>
          </p>
        </div>
      </footer>
    </>
  );
}
