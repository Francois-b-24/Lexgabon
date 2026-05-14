import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export async function SiteHeader() {
  const t = await getTranslations("Landing");
  const n = await getTranslations("Nav");

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[var(--lg-gold-faint)] bg-lg-navy px-3 py-3 sm:px-6 md:px-9 md:py-4">
      <Link href="/" className="min-w-0 shrink-0">
        <Logo tagline={t("tagline")} />
      </Link>
      <div className="flex max-w-full flex-1 items-center justify-end overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:max-w-none md:flex-none [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4 md:gap-6">
        <Link
          href="/#textes"
          className="shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]"
        >
          {n("textes")}
        </Link>
        <Link
          href="/veille"
          className="shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]"
        >
          {n("veille")}
        </Link>
        <Link
          href="/recherche"
          className="shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]"
        >
          {n("recherche")}
        </Link>
        <Link
          href="/chatbot"
          className="shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]"
        >
          {n("chatbot")}
        </Link>
        <Link
          href="/#api"
          className="shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]"
        >
          {n("api")}
        </Link>
        </div>
      </div>
    </nav>
  );
}
