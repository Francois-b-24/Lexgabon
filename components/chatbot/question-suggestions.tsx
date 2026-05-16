"use client";

import { useTranslations } from "next-intl";
import { IconSparkles } from "@tabler/icons-react";
import { useMemo } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  buildSuggestionMessage,
  getSuggestionsForProfile,
  type SuggestionDomaine,
} from "@/lib/amaia-suggestions";

/**
 * Suggestions cliquables sur la page chatbot (T2.2).
 * - 6 à 9 cartes filtrées par le profil utilisateur (T1.6).
 * - Au clic, `onPick` reçoit le texte complet (prompt + contextHint).
 * - Affiché uniquement avant la première question utilisateur (l'appelant le contrôle).
 */

const DOMAINE_ACCENT: Record<SuggestionDomaine, string> = {
  travail: "border-emerald-400/30 bg-emerald-500/[0.06] hover:border-emerald-400/60",
  commercial: "border-lg-gold/30 bg-lg-gold/[0.07] hover:border-lg-gold/60",
  fiscal: "border-sky-400/30 bg-sky-500/[0.06] hover:border-sky-400/60",
  civil: "border-rose-400/30 bg-rose-500/[0.06] hover:border-rose-400/60",
  penal: "border-amber-500/30 bg-amber-500/[0.06] hover:border-amber-500/60",
  famille: "border-pink-400/30 bg-pink-500/[0.06] hover:border-pink-400/60",
  social: "border-teal-400/30 bg-teal-500/[0.06] hover:border-teal-400/60",
  general: "border-white/15 bg-white/[0.04] hover:border-white/40",
};

export function QuestionSuggestions({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Chatbot.suggestions");
  const { profile, hydrated } = useUserProfile();

  // On évite le mismatch SSR : pré-hydratation = pas de cartes (placeholder discret).
  const items = useMemo(
    () => (hydrated ? getSuggestionsForProfile(profile) : []),
    [profile, hydrated],
  );

  if (!hydrated) {
    return (
      <div
        aria-hidden
        className="mx-auto h-32 w-full max-w-3xl animate-pulse rounded-lg border border-white/5 bg-white/[0.02]"
      />
    );
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-label={t("title")}
      className="mx-auto flex w-full max-w-3xl flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <IconSparkles size={14} className="shrink-0 text-lg-gold/70" />
        <p className="text-[10px] font-medium uppercase tracking-wider text-lg-gold/70">
          {t("title")}
        </p>
        <p className="ml-auto text-[10px] italic text-white/30">
          {profile ? t("filteredByProfile", { profile: t(`profileLabel.${profile}`) }) : t("hint")}
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(buildSuggestionMessage(s))}
              className={`flex h-full w-full flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition disabled:opacity-40 ${DOMAINE_ACCENT[s.domaine]}`}
            >
              <span className="text-[10px] uppercase tracking-wider text-white/45">
                {t(`domaine.${s.domaine}`)}
              </span>
              <span className="text-[13px] leading-snug text-white/85">{s.prompt}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
