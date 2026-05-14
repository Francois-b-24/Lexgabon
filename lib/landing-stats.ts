import { max, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { textes } from "@/lib/db/schema";
import { getMeili } from "@/lib/meilisearch";
import { mockVeille } from "@/lib/mock/veille";
import { OFFICIAL_LANDING_SOURCES } from "@/lib/official-sources";

export type LandingStats = {
  indexedCount: number;
  indexedDisplay: string;
  officialSourcesCount: number;
  /** Grande ligne du 4e bloc stats (date courte ou libellé démo) */
  lastUpdatePrimary: string;
  /** Sous-titre du 4e bloc : index temps réel vs sélection institutionnelle sans index. */
  lastUpdateSecondary: "live" | "curated";
};

function formatInt(n: number, locale: string): string {
  return n.toLocaleString(locale === "en" ? "en-US" : "fr-FR");
}

function formatDateShort(iso: string, locale: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function countFromMeili(): Promise<number | null> {
  const client = getMeili();
  if (!client) return null;
  try {
    const stats = await client.index("textes").getStats();
    return typeof stats.numberOfDocuments === "number" ? stats.numberOfDocuments : null;
  } catch {
    return null;
  }
}

async function countFromDb(): Promise<number | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const row = await db.select({ c: sql<number>`count(*)::int` }).from(textes);
    return row[0]?.c ?? 0;
  } catch {
    return null;
  }
}

async function lastPublicationFromDb(): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const row = await db
      .select({ d: max(textes.datePublication) })
      .from(textes);
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
 * Chiffres affichés sur la landing : Meili > DB > sélection veille pour l’index ;
 * date affichée : DB puis dernière publication datée citée dans la veille institutionnelle.
 */
export async function getLandingStats(locale: string): Promise<LandingStats> {
  const meiliCount = await countFromMeili();
  const dbCount = await countFromDb();
  const mockCount = mockVeille.length;

  let indexedCount: number;
  let lastUpdateSecondary: "live" | "curated";

  if (meiliCount != null) {
    indexedCount = meiliCount;
    lastUpdateSecondary = "live";
  } else if (dbCount != null) {
    indexedCount = dbCount;
    lastUpdateSecondary = "live";
  } else {
    indexedCount = mockCount;
    lastUpdateSecondary = "curated";
  }

  const indexedDisplay = formatInt(indexedCount, locale);

  let lastIso = await lastPublicationFromDb();
  if (!lastIso) lastIso = lastIsoFromOfficialVeille();

  const lastUpdatePrimary = lastIso ? formatDateShort(lastIso, locale) : "—";

  return {
    indexedCount,
    indexedDisplay,
    officialSourcesCount: OFFICIAL_LANDING_SOURCES.length,
    lastUpdatePrimary,
    lastUpdateSecondary,
  };
}
