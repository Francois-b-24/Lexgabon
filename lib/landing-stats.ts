import { max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { textes } from "@/lib/db/schema";
import { mockVeille } from "@/lib/mock/veille";
import { OFFICIAL_LANDING_SOURCES } from "@/lib/official-sources";

export type LandingStats = {
  officialSourcesCount: number;
  /** Grande ligne du 4e bloc stats (date courte ou libellé démo) */
  lastUpdatePrimary: string;
  /** Sous-titre du 4e bloc : index temps réel vs sélection institutionnelle sans index. */
  lastUpdateSecondary: "live" | "curated";
};

function formatDateShort(iso: string, locale: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function lastPublicationFromDb(): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const row = await db.select({ d: max(textes.datePublication) }).from(textes);
    const v = row[0]?.d;
    if (v == null) return null;
    if (typeof v === "string") return v;
    return String(v);
  } catch {
    return null;
  }
}

/** Dernière date éditoriale parmi les entrées veille **datées** (exclut les fiches « portail » sans date). */
function lastIsoFromOfficialVeille(): string | null {
  let best: string | null = null;
  for (const item of mockVeille) {
    if (item.date === "—") continue;
    const { dateIso } = item;
    if (!dateIso) continue;
    if (!best || dateIso > best) best = dateIso;
  }
  return best;
}

/**
 * Chiffres landing (hors compteur « textes indexés », affiché en statique sur la page).
 * Date : DB puis dernière publication datée citée dans la veille institutionnelle.
 */
export async function getLandingStats(locale: string): Promise<LandingStats> {
  const dbIso = await lastPublicationFromDb();
  const lastIso = dbIso ?? lastIsoFromOfficialVeille();
  const lastUpdatePrimary = lastIso ? formatDateShort(lastIso, locale) : "—";
  const lastUpdateSecondary = dbIso != null ? "live" : "curated";

  return {
    officialSourcesCount: OFFICIAL_LANDING_SOURCES.length,
    lastUpdatePrimary,
    lastUpdateSecondary,
  };
}
