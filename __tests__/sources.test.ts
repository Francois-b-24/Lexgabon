import { describe, expect, it } from "vitest";
import {
  ALL_SOURCE_URL_SLUGS,
  dbCodesFromUrlSlug,
  isValidSourceUrlSlug,
  sourceLabelFr,
  sourceUrlSlugFromDbCode,
} from "@/lib/sources";

describe("lib/sources mapping", () => {
  it("convertit le code DB en slug d'URL", () => {
    expect(sourceUrlSlugFromDbCode("JOG")).toBe("jo-ga");
    expect(sourceUrlSlugFromDbCode("OHADA")).toBe("ohada");
    expect(sourceUrlSlugFromDbCode("CEMAC")).toBe("cemac");
    expect(sourceUrlSlugFromDbCode("COBAC")).toBe("cobac");
  });

  it("tolère les variantes de casse pour le code DB", () => {
    expect(sourceUrlSlugFromDbCode("ohada")).toBe("ohada");
    expect(sourceUrlSlugFromDbCode("Cemac")).toBe("cemac");
  });

  it("retourne null pour les codes inconnus ou vides", () => {
    expect(sourceUrlSlugFromDbCode("INCONNU")).toBeNull();
    expect(sourceUrlSlugFromDbCode("")).toBeNull();
    expect(sourceUrlSlugFromDbCode(null)).toBeNull();
    expect(sourceUrlSlugFromDbCode(undefined)).toBeNull();
  });

  it("liste les codes DB compatibles avec un slug d'URL", () => {
    expect(dbCodesFromUrlSlug("jo-ga")).toContain("JOG");
    expect(dbCodesFromUrlSlug("ohada")).toEqual(["OHADA"]);
    expect(dbCodesFromUrlSlug("inconnu")).toEqual([]);
  });

  it("valide les slugs d'URL et leurs labels FR", () => {
    expect(isValidSourceUrlSlug("jo-ga")).toBe(true);
    expect(isValidSourceUrlSlug("xxx")).toBe(false);
    expect(sourceLabelFr("jo-ga")).toMatch(/Journal officiel/);
    expect(sourceLabelFr("ohada")).toBe("OHADA");
  });

  it("expose la liste complète des slugs supportés", () => {
    expect(ALL_SOURCE_URL_SLUGS).toContain("jo-ga");
    expect(ALL_SOURCE_URL_SLUGS).toContain("ohada");
    expect(ALL_SOURCE_URL_SLUGS).toContain("cemac");
    expect(ALL_SOURCE_URL_SLUGS).toContain("cobac");
  });
});
