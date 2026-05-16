/**
 * Tests de l'algorithme de diff entre versions de texte (T2.5).
 */
import { describe, expect, it } from "vitest";
import { diffArticleContents, diffVersions, type VersionPayload } from "@/lib/text-diff";

const before: VersionPayload = {
  articles: [
    { numero: "1", contenu: "Disposition initiale." },
    { numero: "2", contenu: "Le préavis est de un mois. Il court dès la notification." },
    { numero: "3", contenu: "Cet article sera supprimé." },
  ],
};

const after: VersionPayload = {
  articles: [
    { numero: "1", contenu: "Disposition initiale." }, // inchangé
    { numero: "2", contenu: "Le préavis est de deux mois. Il court dès la notification." }, // modifié
    // article 3 absent → supprimé
    { numero: "4", contenu: "Article nouvellement introduit." }, // ajouté
  ],
};

describe("diffVersions", () => {
  it("compte correctement chaque statut", () => {
    const d = diffVersions(before, after);
    expect(d.unchanged).toBe(1);
    expect(d.modified).toBe(1);
    expect(d.removed).toBe(1);
    expect(d.added).toBe(1);
    expect(d.articles).toHaveLength(4);
  });

  it("préserve l'ordre des articles de la version finale, puis les supprimés", () => {
    const d = diffVersions(before, after);
    const numeros = d.articles.map((a) => a.numero);
    // d'abord 1, 2 (présents dans after), puis 4 (ajouté), puis 3 (uniquement before)
    expect(numeros).toEqual(["1", "2", "4", "3"]);
  });

  it("marque comme `modified` un article avec contenu différent et calcule les segments", () => {
    const d = diffVersions(before, after);
    const art2 = d.articles.find((a) => a.numero === "2");
    expect(art2?.status).toBe("modified");
    expect(art2?.segments).toBeDefined();
    const ops = (art2?.segments ?? []).map((s) => s.op);
    expect(ops).toContain("delete");
    expect(ops).toContain("insert");
  });

  it("article `added` n'a pas de segments mais a `after` rempli", () => {
    const d = diffVersions(before, after);
    const art4 = d.articles.find((a) => a.numero === "4");
    expect(art4?.status).toBe("added");
    expect(art4?.before).toBeNull();
    expect(art4?.after?.contenu).toContain("nouvellement");
    expect(art4?.segments).toBeUndefined();
  });

  it("article `removed` a `before` rempli, `after` à null", () => {
    const d = diffVersions(before, after);
    const art3 = d.articles.find((a) => a.numero === "3");
    expect(art3?.status).toBe("removed");
    expect(art3?.after).toBeNull();
    expect(art3?.before?.contenu).toContain("supprimé");
  });

  it("deux versions identiques → tout unchanged", () => {
    const d = diffVersions(before, before);
    expect(d.modified).toBe(0);
    expect(d.added).toBe(0);
    expect(d.removed).toBe(0);
    expect(d.unchanged).toBe(before.articles.length);
  });
});

describe("diffArticleContents", () => {
  it("retourne une seule opération equal quand identique", () => {
    const segs = diffArticleContents("Phrase unique.", "Phrase unique.");
    expect(segs).toHaveLength(1);
    expect(segs[0]).toEqual({ op: "equal", text: "Phrase unique." });
  });

  it("retourne uniquement des insertions quand `before` est vide", () => {
    const segs = diffArticleContents("", "Une nouvelle phrase.");
    expect(segs.every((s) => s.op === "insert")).toBe(true);
  });

  it("retourne uniquement des suppressions quand `after` est vide", () => {
    const segs = diffArticleContents("Une phrase à supprimer.", "");
    expect(segs.every((s) => s.op === "delete")).toBe(true);
  });

  it("mêle equal/insert/delete sur des phrases modifiées", () => {
    const segs = diffArticleContents(
      "Phrase A. Phrase B. Phrase C.",
      "Phrase A. Phrase modifiée. Phrase C.",
    );
    const ops = segs.map((s) => s.op);
    expect(ops).toContain("equal");
    expect(ops).toContain("insert");
    expect(ops).toContain("delete");
  });
});
