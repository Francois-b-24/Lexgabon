"use client";

import { useTranslations } from "next-intl";
import { IconSparkles } from "@tabler/icons-react";
import { useMemo } from "react";
import {
  buildSuggestionMessage,
  getSuggestionsForDomaine,
  type SuggestionDomaine,
} from "@/lib/amaia-suggestions";

/**
 * Suggestions cliquables sur la page chatbot.
 * - 5 cartes filtrées par le thème sélectionné (prop `domaine`).
 * - Aucun thème sélectionné : message invitant à choisir un thème.
 * - Au clic, `onPick` reçoit le texte complet (prompt + contextHint).
 * - Affiché uniquement avant la première question utilisateur (l'appelant contrôle).
 */

const DOMAINE_ACCENT: Record<SuggestionDomaine, string> = {
  civil: "border-rose-400/30 bg-rose-500/[0.06] hover:border-rose-400/60",
  commercial: "border-lg-gold/30 bg-lg-gold/[0.07] hover:border-lg-gold/60",
  travail: "border-emerald-400/30 bg-emerald-500/[0.06] hover:border-emerald-400/60",
  fonction_publique: "border-violet-400/30 bg-violet-500/[0.06] hover:border-violet-400/60",
  fiscal: "border-sky-400/30 bg-sky-500/[0.06] hover:border-sky-400/60",
};

export function QuestionSuggestions({
  domaine,
  onPick,
  disabled,
}: {
  domaine: SuggestionDomaine | null;
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Chatbot.suggestions");
  const tTheme = useTranslations("Chatbot.themeSelector");

  const items = useMemo(() => getSuggestionsForDomaine(domaine), [domaine]);

  if (!domaine) {
    return (
      <section
        aria-label={t("title")}
        className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3"
      >
        <IconSparkles size={14} className="shrink-0 text-lg-gold/70" />
        <p className="text-[12px] italic text-white/55">{t("chooseTheme")}</p>
      </section>
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
          {t("filteredByTheme", { theme: tTheme(`option.${domaine}`) })}
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
              <span className="text-[13px] leading-snug text-white/85">{s.prompt}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
