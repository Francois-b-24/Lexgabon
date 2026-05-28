"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const linkClass =
  "shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]";

const mobileLinkClass =
  "block rounded-lg px-3 py-3 font-landing-sans text-[11px] uppercase tracking-[0.12em] text-white/85 transition-colors hover:bg-white/[0.06] hover:text-lg-gold-soft active:bg-white/[0.1] sm:px-6";

export function SiteHeader() {
  const t = useTranslations("Landing");
  const n = useTranslations("Nav");
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  const items = [
    { href: "/", label: n("home") },
    { href: "/veille", label: n("veille") },
    { href: "/recherche", label: n("recherche") },
    { href: "/chatbot", label: n("chatbot") },
    { href: "/a-propos", label: n("apropos") },
  ] as const;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--lg-gold-faint)] bg-lg-navy",
        open && "shadow-lg shadow-black/20",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 md:gap-6 md:px-9 md:py-4">
        <Link href="/" className="min-w-0 flex-shrink overflow-hidden">
          <Logo tagline={t("tagline")} />
        </Link>

        <div className="ml-auto hidden min-w-0 max-w-full items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex md:gap-6 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:gap-3">
          <span className="hidden h-4 w-px bg-white/15 md:block" aria-hidden />
          <button
            type="button"
            onClick={() => switchLocale(locale === "fr" ? "en" : "fr")}
            className="shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft"
            aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
          >
            <span className={locale === "fr" ? "text-white" : "text-white/40"}>fr</span>
            <span className="mx-1 text-white/25">·</span>
            <span className={locale === "en" ? "text-white" : "text-white/40"}>en</span>
          </button>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/80 transition-colors hover:border-lg-gold-soft/50 hover:text-lg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-gold-soft md:hidden"
            aria-expanded={open}
            aria-controls="site-nav-mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? n("menuClose") : n("menuOpen")}</span>
            {open ? <IconX size={20} stroke={1.5} aria-hidden /> : <IconMenu2 size={20} stroke={1.5} aria-hidden />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="site-nav-mobile-menu"
          className="flex flex-col gap-0.5 border-t border-white/[0.08] bg-lg-navy px-1.5 pb-3 pt-1.5 md:hidden"
          role="navigation"
          aria-label={n("menuLabel")}
        >
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={mobileLinkClass} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
