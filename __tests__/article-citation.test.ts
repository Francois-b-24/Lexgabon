/**
 * Test de `buildArticleCitation` (T2.1).
 *
 * Format normalisé attendu : « Art. N de <Code> (<reference>) ».
 * Sert au bouton « Copier la citation normalisée » sur chaque article.
 */
import { describe, expect, it } from "vitest";
import { buildArticleCitation } from "@/components/textes/texte-actions";

describe("buildArticleCitation", () => {
  it("compose le format standard avec référence", () => {
    expect(
      buildArticleCitation(
        "12",
        "Code du travail de la République gabonaise",
        "Loi n° 022/2021 du 19 novembre 2021",
      ),
    ).toBe(
      "Art. 12 du Code du travail de la République gabonaise (Loi n° 022/2021 du 19 novembre 2021)",
    );
  });

  it("supprime la mention « (doublon) » ou similaire en suffixe du titre", () => {
    expect(
      buildArticleCitation(
        "5",
        "Code du travail (doublon)",
        "Loi n° 022/2021",
      ),
    ).toBe("Art. 5 du Code du travail (Loi n° 022/2021)");
  });

  it("omet la référence si elle est null", () => {
    expect(buildArticleCitation("3", "Code civil", null)).toBe("Art. 3 du Code civil");
  });

  it("ne duplique pas la référence si elle figure déjà dans le titre", () => {
    expect(
      buildArticleCitation(
        "1",
        "Loi 022/2021 — Code du travail",
        "Loi 022/2021",
      ),
    ).toBe("Art. 1 du Loi 022/2021 — Code du travail");
  });

  it("supporte les numéros « bis » et autres suffixes", () => {
    expect(
      buildArticleCitation("12 bis", "Code OHADA", "Acte uniforme 2014"),
    ).toBe("Art. 12 bis du Code OHADA (Acte uniforme 2014)");
  });
});
