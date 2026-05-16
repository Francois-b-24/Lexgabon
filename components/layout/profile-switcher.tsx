"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconChevronDown, IconUserCircle } from "@tabler/icons-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { USER_PROFILES, type UserProfile } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

/**
 * Sélecteur de profil utilisateur, intégré au header.
 *
 * - Desktop (md+) : pill avec label « Profil non défini » / « Avocat » / etc.
 * - Mobile (<md) : icône seule avec un point or si profil actif. Le popover
 *   prend toute la largeur sous le header pour éviter tout débordement.
 */
export function ProfileSwitcher() {
  const t = useTranslations("Profile");
  const { profile, setProfile, hydrated } = useUserProfile();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = useCallback(
    (next: UserProfile | null) => {
      setProfile(next);
      setOpen(false);
    },
    [setProfile],
  );

  const currentLabel = profile ? t(`option.${profile}`) : t("none");

  // Avant hydratation : placeholder sobre, même empreinte qu'après pour éviter
  // tout saut visuel. Compact (icône) au mobile, pill au desktop.
  if (!hydrated) {
    return (
      <>
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.02] md:hidden"
          aria-hidden
        />
        <div
          className="hidden h-9 w-32 shrink-0 rounded-md border border-white/10 bg-white/[0.02] md:block"
          aria-hidden
        />
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={profile ? t("ariaWithProfile", { profile: currentLabel }) : t("ariaWithoutProfile")}
        className={cn(
          "flex h-9 items-center rounded-md border transition-colors",
          // Mobile : compact (icône seule, carré).
          "w-9 justify-center md:w-auto md:gap-1.5 md:justify-start md:px-2.5",
          // Desktop : pill avec label.
          "md:font-landing-sans md:text-[11px] md:uppercase md:tracking-[0.1em]",
          profile
            ? "border-lg-gold/40 bg-lg-gold/10 text-lg-gold-light hover:border-lg-gold/60"
            : "border-white/15 bg-white/[0.04] text-white/70 hover:border-lg-gold-soft/40 hover:text-white",
        )}
      >
        <span className="relative inline-flex">
          <IconUserCircle size={16} className="shrink-0" aria-hidden />
          {profile ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-lg-gold"
              aria-hidden
            />
          ) : null}
        </span>
        <span className="hidden whitespace-nowrap md:inline">{currentLabel}</span>
        <IconChevronDown
          size={12}
          aria-hidden
          className={cn("hidden shrink-0 transition-transform md:inline", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 overflow-hidden rounded-lg border border-white/10 bg-lg-navy-deep shadow-xl shadow-black/40",
            // Mobile : ancré à droite du bouton, max-w-[calc(100vw-1.5rem)] empêche
            // tout débordement même sur iPhone SE (320px). Desktop : 14rem fixe.
            "right-0 top-full mt-2 w-[min(20rem,calc(100vw-1.5rem))] md:w-56",
          )}
        >
          <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/40">
            {t("title")}
          </p>
          <ul className="flex flex-col py-1">
            {USER_PROFILES.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={profile === p}
                  onClick={() => handleSelect(p)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[12px] transition-colors hover:bg-white/[0.05]",
                    profile === p ? "text-lg-gold-light" : "text-white/85",
                  )}
                >
                  <span className="w-full font-medium leading-snug">{t(`option.${p}`)}</span>
                  <span className="w-full whitespace-normal break-words text-[10px] font-light leading-snug text-white/45">
                    {t(`hint.${p}`)}
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={profile === null}
                onClick={() => handleSelect(null)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-[11px] italic text-white/55 transition-colors hover:bg-white/[0.05]",
                  profile === null && "text-lg-gold-light",
                )}
              >
                {t("none")}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
