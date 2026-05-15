/**
 * Tests unitaires de `parseSearchFilters` + `clampPageSize` du service de recherche.
 *
 * On NE teste pas l'intégration Meilisearch/backend ici (nécessite un index réel).
 * Ce sont les fonctions pures qui transforment les query params en `SearchFilters`
 * — point critique pour la sécurité (validation entrées) et le SSR (URL canonique).
 */
import { describe, expect, it } from "vitest";

// On importe directement le module — il dépend de `server-only` qui est un noop côté test si
// jamais l'environnement n'est pas serveur. En pratique vitest tourne en jsdom et le module
// `server-only` se contente d'exporter `{}`.
import { clampPageSize, parseSearchFilters } from "@/lib/search-service";

describe("parseSearchFilters", () => {
  it("retourne des valeurs par défaut quand l'URL est vide", () => {
    const f = parseSearchFilters(new URLSearchParams());
    expect(f.q).toBe("");
    expect(f.mode).toBe("fulltext");
    expect(f.sources).toEqual([]);
    expect(f.types).toEqual([]);
    expect(f.domaines).toEqual([]);
    expect(f.dateFrom).toBeNull();
    expect(f.dateTo).toBeNull();
    expect(f.page).toBe(1);
    expect(f.pageSize).toBe(20);
  });

  it("tronque la query à 256 caractères", () => {
    const long = "x".repeat(300);
    const f = parseSearchFilters(new URLSearchParams({ q: long }));
    expect(f.q.length).toBe(256);
  });

  it("accepte mode=semantic mais rejette tout autre valeur en faveur de fulltext", () => {
    expect(parseSearchFilters(new URLSearchParams({ mode: "semantic" })).mode).toBe("semantic");
    expect(parseSearchFilters(new URLSearchParams({ mode: "fulltext" })).mode).toBe("fulltext");
    expect(parseSearchFilters(new URLSearchParams({ mode: "evil" })).mode).toBe("fulltext");
    expect(parseSearchFilters(new URLSearchParams({ mode: "" })).mode).toBe("fulltext");
  });

  it("filtre les sources sur l'allowlist + déduplique", () => {
    const sp = new URLSearchParams();
    sp.append("source", "jo-ga");
    sp.append("source", "ohada");
    sp.append("source", "jo-ga");
    sp.append("source", "inconnu");
    const f = parseSearchFilters(sp);
    expect(f.sources).toEqual(["jo-ga", "ohada"]);
  });

  it("filtre les domaines sur format alphanumérique simple", () => {
    const sp = new URLSearchParams();
    sp.append("domaine", "civil");
    sp.append("domaine", "<script>");
    sp.append("domaine", "droit-bancaire");
    const f = parseSearchFilters(sp);
    expect(f.domaines).toEqual(["civil", "droit-bancaire"]);
  });

  it("valide les dates ISO YYYY-MM-DD strictes et rejette le reste", () => {
    expect(parseSearchFilters(new URLSearchParams({ date_from: "2024-01-15" })).dateFrom).toBe(
      "2024-01-15",
    );
    expect(parseSearchFilters(new URLSearchParams({ date_from: "2024-1-5" })).dateFrom).toBeNull();
    expect(parseSearchFilters(new URLSearchParams({ date_from: "hier" })).dateFrom).toBeNull();
    expect(parseSearchFilters(new URLSearchParams({ date_from: "2024-13-40" })).dateFrom).toBeNull();
  });

  it("normalise la page à 1 minimum", () => {
    expect(parseSearchFilters(new URLSearchParams({ page: "0" })).page).toBe(1);
    expect(parseSearchFilters(new URLSearchParams({ page: "-3" })).page).toBe(1);
    expect(parseSearchFilters(new URLSearchParams({ page: "abc" })).page).toBe(1);
    expect(parseSearchFilters(new URLSearchParams({ page: "7" })).page).toBe(7);
  });
});

describe("clampPageSize", () => {
  it("retourne le défaut quand non renseigné", () => {
    expect(clampPageSize(undefined)).toBe(20);
    expect(clampPageSize(NaN)).toBe(20);
  });

  it("traite 0 comme absent (retourne défaut)", () => {
    expect(clampPageSize(0)).toBe(20);
  });

  it("borne les valeurs négatives à 1 et les très grandes à 50", () => {
    expect(clampPageSize(-5)).toBe(1);
    expect(clampPageSize(1000)).toBe(50);
    expect(clampPageSize(25)).toBe(25);
  });

  it("tronque les flottants", () => {
    expect(clampPageSize(20.7)).toBe(20);
  });
});
