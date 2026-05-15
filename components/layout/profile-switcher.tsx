"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconChevronDown, IconUserCircle } from "@tabler/icons-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { USER_PROFILES, type UserProfile } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

/**
 * Sélecteur de profil utilisateur. Discret, intégré au header.
 * Au clic : popover avec 4 entrées (3 profils + « non défini »).
 * Aucun login requis, choix purement local (cookie + localStorage).
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

  // Avant hydratation : on rend un placeholder accessible pour éviter le mismatch SSR.
  if (!hydrated) {
    return (
      <div
        className="hidden h-9 w-32 shrink-0 rounded-md border border-white/10 bg-white/[0.02] sm:block"
        aria-hidden
      />
    );
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-landing-sans text-[10px] uppercase tracking-[0.1em] transition-colors sm:text-[11px]",
          profile
            ? "border-lg-gold/30 bg-lg-gold/10 text-lg-gold-light hover:border-lg-gold/50"
            : "border-white/15 bg-white/[0.04] text-white/70 hover:border-lg-gold-soft/40 hover:text-white",
        )}
      >
        <IconUserCircle size={14} className="shrink-0" />
        <span className="whitespace-nowrap">{currentLabel}</span>
        <IconChevronDown
          size={12}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-56 rounded-lg border border-white/10 bg-lg-navy-deep shadow-lg shadow-black/30"
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
                  <span className="font-medium">{t(`option.${p}`)}</span>
                  <span className="text-[10px] font-light text-white/45">
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
