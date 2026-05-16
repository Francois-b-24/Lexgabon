/**
 * Seed mock pour démontrer la comparaison de versions (T2.5).
 *
 * Crée (si absent) un texte fictif `loi-demo-finance-2024` rattaché à la source
 * `JOG`, puis insère deux versions : 2024 (initiale) et 2025 (réforme).
 * Idempotent : on supprime les versions existantes avant insertion pour permettre
 * la ré-exécution sans accumulation.
 *
 * Usage : DATABASE_URL=postgres://... npx tsx scripts/seed-text-versions.ts
 */
import { eq } from "drizzle-orm";

import { getDb } from "../lib/db";
import { sources, textes, textVersions } from "../lib/db/schema";

const TEXT_SLUG = "loi-demo-finance-2024";
const SOURCE_CODE = "JOG";

async function ensureSource(db: NonNullable<ReturnType<typeof getDb>>): Promise<number> {
  const existing = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.code, SOURCE_CODE))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const inserted = await db
    .insert(sources)
    .values({
      code: SOURCE_CODE,
      nom: "Journal officiel du Gabon",
      urlBase: "https://journal-officiel.ga/",
      estActif: true,
    })
    .returning({ id: sources.id });
  return inserted[0].id;
}

async function ensureTexte(
  db: NonNullable<ReturnType<typeof getDb>>,
  sourceId: number,
): Promise<string> {
  const existing = await db
    .select({ id: textes.id })
    .from(textes)
    .where(eq(textes.slug, TEXT_SLUG))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const inserted = await db
    .insert(textes)
    .values({
      slug: TEXT_SLUG,
      sourceId,
      type: "loi",
      reference: "Loi de finances 2024 (texte de démonstration)",
      titre: "Loi de finances 2024 — démonstration LexGabon",
      datePublication: "2024-01-01",
      urlSource: "https://journal-officiel.ga/",
      domaineSlug: "fiscal",
      estEnVigueur: true,
      resume:
        "Texte fictif utilisé pour démontrer la fonctionnalité de comparaison de versions sur LexGabon.",
    })
    .returning({ id: textes.id });
  return inserted[0].id;
}

const VERSION_2024 = {
  articles: [
    {
      numero: "1",
      contenu:
        "La présente loi fixe les ressources et les charges de l'État pour l'exercice 2024. " +
        "Elle s'applique à l'ensemble des opérations budgétaires et de trésorerie de l'État.",
    },
    {
      numero: "2",
      contenu:
        "Le taux normal de la taxe sur la valeur ajoutée est fixé à 18%. " +
        "Le taux réduit applicable aux biens de première nécessité reste à 5%.",
    },
    {
      numero: "3",
      contenu:
        "Les contribuables doivent déposer leur déclaration annuelle avant le 31 mars. " +
        "Tout retard entraîne une majoration de 10% par mois.",
    },
    {
      numero: "4",
      contenu:
        "Article supprimé en 2025 : disposition transitoire applicable uniquement à l'exercice 2024.",
    },
  ],
};

const VERSION_2025 = {
  articles: [
    {
      numero: "1",
      contenu:
        "La présente loi fixe les ressources et les charges de l'État pour l'exercice 2025. " +
        "Elle s'applique à l'ensemble des opérations budgétaires et de trésorerie de l'État.",
    },
    {
      numero: "2",
      contenu:
        "Le taux normal de la taxe sur la valeur ajoutée est fixé à 18%. " +
        "Le taux réduit applicable aux biens de première nécessité est porté à 7%. " +
        "Un taux super-réduit de 0% est créé pour les produits pharmaceutiques essentiels.",
    },
    {
      numero: "3",
      contenu:
        "Les contribuables doivent déposer leur déclaration annuelle avant le 30 avril. " +
        "Tout retard entraîne une majoration de 10% par mois.",
    },
    // article 4 supprimé
    {
      numero: "5",
      contenu:
        "Crédit d'impôt pour la recherche : les entreprises bénéficient d'un crédit égal à 20% " +
        "des dépenses de R&D engagées au cours de l'exercice. Plafond fixé à 50 millions FCFA.",
    },
  ],
};

async function main() {
  const db = getDb();
  if (!db) {
    console.error("[seed-text-versions] DATABASE_URL absent. Abandon.");
    process.exit(1);
  }
  const sourceId = await ensureSource(db);
  const texteId = await ensureTexte(db, sourceId);

  // Reset idempotent.
  await db.delete(textVersions).where(eq(textVersions.texteId, texteId));

  await db.insert(textVersions).values([
    {
      texteId,
      label: "Version initiale 2024",
      dateValidite: "2024-01-01",
      contenuJson: VERSION_2024,
    },
    {
      texteId,
      label: "Réforme janvier 2025",
      dateValidite: "2025-01-01",
      contenuJson: VERSION_2025,
    },
  ]);

  console.log(`[seed-text-versions] OK : texte ${TEXT_SLUG} (id=${texteId}), 2 versions insérées.`);
}

main().catch((e) => {
  console.error("[seed-text-versions] fatal", e);
  process.exit(1);
});
