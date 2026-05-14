import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export async function SiteHeader() {
  const t = await getTranslations("Landing");
  const n = await getTranslations("Nav");

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--lg-gold-faint)] bg-lg-navy px-6 py-4 md:px-9">
      <Link href="/">
        <Logo tagline={t("tagline")} />
      </Link>
      <div className="hidden items-center gap-6 md:flex">
        <Link
          href="/#textes"
          className="font-landing-sans text-[11px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft"
        >
          {n("textes")}
        </Link>
        <Link
          href="/veille"
          className="font-landing-sans text-[11px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft"
        >
          {n("veille")}
        </Link>
        <Link
          href="/recherche"
          className="font-landing-sans text-[11px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft"
        >
          {n("recherche")}
        </Link>
        <Link
          href="/amaia"
          className="font-landing-sans text-[11px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft"
        >
          {n("amaia")}
        </Link>
        <Link
          href="/#api"
          className="font-landing-sans text-[11px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft"
        >
          {n("api")}
        </Link>
      </div>
    </nav>
  );
}
