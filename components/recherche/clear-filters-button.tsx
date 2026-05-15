"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

/** Bouton client minimal pour vider tous les filtres et revenir à `/recherche`. */
export function ClearFiltersButton() {
  const t = useTranslations("Recherche");
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/recherche")}
      className="rounded-md border border-white/15 px-2.5 py-1.5 text-[11px] text-white/65 transition hover:border-lg-gold/35 hover:text-white"
    >
      {t("clearFilters")}
    </button>
  );
}
