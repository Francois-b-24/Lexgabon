"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Logo } from "@/components/brand/logo";
import { ProfileSwitcher } from "@/components/layout/profile-switcher";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

const linkClass =
  "shrink-0 font-landing-sans text-[10px] uppercase tracking-[0.1em] text-white/60 transition-colors hover:text-lg-gold-soft sm:text-[11px]";

const mobileLinkClass =
  "block rounded-lg px-3 py-3 font-landing-sans text-[11px] uppercase tracking-[0.12em] text-white/85 transition-colors hover:bg-white/[0.06] hover:text-lg-gold-soft active:bg-white/[0.1] sm:px-6";

export function SiteHeader() {
  const t = useTranslations("Landing");
  const n = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = [
    { href: "/#textes", label: n("textes") },
    { href: "/veille", label: n("veille") },
    { href: "/recherche", label: n("recherche") },
    { href: "/chatbot", label: n("chatbot") },
    { href: "/methodologie", label: n("methodologie") },
    { href: "/#api", label: n("api") },
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
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-3 sm:px-6 md:px-9 md:py-4">
        <Link href="/" className="min-w-0 shrink-0">
          <Logo tagline={t("tagline")} />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <div className="hidden max-w-full items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex md:gap-6 [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>

          <ProfileSwitcher />

          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/80 transition-colors hover:border-lg-gold-soft/50 hover:text-lg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-gold-soft md:hidden"
            aria-expanded={open}
            aria-controls="site-nav-mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? n("menuClose") : n("menuOpen")}</span>
            {open ? <IconX size={22} stroke={1.5} aria-hidden /> : <IconMenu2 size={22} stroke={1.5} aria-hidden />}
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
