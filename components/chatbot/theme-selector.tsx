"use client";

import { useTranslations } from "next-intl";
import { IconChevronDown } from "@tabler/icons-react";
import {
  SUGGESTION_DOMAINES,
  type SuggestionDomaine,
} from "@/lib/amaia-suggestions";

/**
 * Sélecteur de thème pour les suggestions du chatbot.
 * Dropdown HTML natif, stylé pour le thème sombre du panel chat.
 */
export function ThemeSelector({
  value,
  onChange,
  disabled,
}: {
  value: SuggestionDomaine | null;
  onChange: (next: SuggestionDomaine | null) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Chatbot.themeSelector");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5">
      <label
        htmlFor="amaia-theme-selector"
        className="text-[10px] font-medium uppercase tracking-wider text-lg-gold/70"
      >
        {t("label")}
      </label>
      <div className="relative">
        <select
          id="amaia-theme-selector"
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) {
              onChange(null);
              return;
            }
            if ((SUGGESTION_DOMAINES as readonly string[]).includes(next)) {
              onChange(next as SuggestionDomaine);
            }
          }}
          className="w-full appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-2.5 pl-3 pr-9 text-[13px] text-white/90 outline-none transition focus:border-lg-gold/40 disabled:opacity-40"
        >
          <option value="" className="bg-lg-navy-deep">
            {t("placeholder")}
          </option>
          {SUGGESTION_DOMAINES.map((d) => (
            <option key={d} value={d} className="bg-lg-navy-deep">
              {t(`option.${d}`)}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={14}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45"
        />
      </div>
    </div>
  );
}
