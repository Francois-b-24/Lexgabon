/**
 * Seed des domaines juridiques (D5).
 *
 * Insère 8 domaines de référence dans la table `domaines` (idempotent par code).
 * Met aussi à jour `textes.domaines[]` à partir de `textes.domaineSlug` quand
 * une correspondance existe, pour brancher la taxonomie hiérarchique côté DB.
 *
 * Usage : DATABASE_URL=postgres://... npx tsx scripts/seed-domaines.ts
 */
import { eq, sql } from "drizzle-orm";

import { getDb } from "../lib/db";
import { domaines } from "../lib/db/schema";

const DOMAINES_REFERENCE = [
  { code: "civil", libelleFr: "Droit civil", libelleEn: "Civil law" },
  { code: "penal", libelleFr: "Droit pénal", libelleEn: "Criminal law" },
  { code: "commercial", libelleFr: "Droit commercial", libelleEn: "Commercial law" },
  { code: "travail", libelleFr: "Droit du travail", libelleEn: "Labour law" },
  { code: "administratif", libelleFr: "Droit administratif", libelleEn: "Administrative law" },
  { code: "fiscal", libelleFr: "Droit fiscal", libelleEn: "Tax law" },
  { code: "famille", libelleFr: "Droit de la famille", libelleEn: "Family law" },
  { code: "social", libelleFr: "Droit social", libelleEn: "Social law" },
] as const;

async function main() {
  const db = getDb();
  if (!db) {
    console.error("[seed-domaines] DATABASE_URL absent. Abandon.");
    process.exit(1);
  }

  let upserted = 0;
  for (const d of DOMAINES_REFERENCE) {
    const existing = await db
      .select({ id: domaines.id })
      .from(domaines)
      .where(eq(domaines.code, d.code))
      .limit(1);
    if (existing[0]) {
      await db
        .update(domaines)
        .set({ libelleFr: d.libelleFr, libelleEn: d.libelleEn })
        .where(eq(domaines.id, existing[0].id));
    } else {
      await db.insert(domaines).values(d);
    }
    upserted++;
  }
  console.log(`[seed-domaines] ${upserted} domaines upsertés`);

  // Lie textes.domaines[] à partir de textes.domaineSlug.
  // Pour chaque texte avec domaineSlug renseigné, on ajoute l'id du domaine correspondant.
  const result = await db.execute(sql`
    UPDATE textes
    SET domaines = ARRAY[(SELECT id FROM domaines WHERE code = textes.domaine_slug)]
    WHERE textes.domaine_slug IS NOT NULL
      AND EXISTS (SELECT 1 FROM domaines WHERE code = textes.domaine_slug)
      AND (textes.domaines IS NULL OR textes.domaines = ARRAY[]::integer[]);
  `);
  console.log(`[seed-domaines] textes liés à domaines.id : ${result.count ?? "?"} lignes affectées`);
}

main().catch((e) => {
  console.error("[seed-domaines] fatal", e);
  process.exit(1);
});
