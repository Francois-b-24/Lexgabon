/**
 * Tests unitaires de `parseVeilleQuery` (T2.4).
 * Tests d'intégration DB / RSS hors scope (Vitest, pas de Postgres en CI ici).
 */
import { describe, expect, it } from "vitest";
import { parseVeilleQuery } from "@/lib/veille-service";

describe("parseVeilleQuery", () => {
  it("retourne des valeurs par défaut quand vide", () => {
    const q = parseVeilleQuery(new URLSearchParams());
    expect(q.sources).toEqual([]);
    expect(q.domaines).toEqual([]);
    expect(q.q).toBe("");
    expect(q.limit).toBe(60);
    expect(q.since).toBeNull();
  });

  it("filtre les sources sur l'allowlist + déduplique", () => {
    const sp = new URLSearchParams();
    sp.append("source", "jo-ga");
    sp.append("source", "ohada");
    sp.append("source", "jo-ga"); // doublon
    sp.append("source", "evil"); // hors allowlist
    const q = parseVeilleQuery(sp);
    expect(q.sources).toEqual(["jo-ga", "ohada"]);
  });

  it("tronque la query à 128 caractères", () => {
    const long = "x".repeat(200);
    const q = parseVeilleQuery(new URLSearchParams({ q: long }));
    expect(q.q.length).toBe(128);
  });

  it("borne le limit entre 1 et 200", () => {
    expect(parseVeilleQuery(new URLSearchParams({ limit: "5" })).limit).toBe(5);
    expect(parseVeilleQuery(new URLSearchParams({ limit: "-3" })).limit).toBe(1);
    expect(parseVeilleQuery(new URLSearchParams({ limit: "1000" })).limit).toBe(200);
    expect(parseVeilleQuery(new URLSearchParams({ limit: "abc" })).limit).toBe(60);
  });

  it("accepte les dates ISO YYYY-MM-DD strictes", () => {
    expect(parseVeilleQuery(new URLSearchParams({ since: "2024-01-01" })).since).toBe(
      "2024-01-01",
    );
    expect(parseVeilleQuery(new URLSearchParams({ since: "2024-1-1" })).since).toBeNull();
    expect(parseVeilleQuery(new URLSearchParams({ since: "hier" })).since).toBeNull();
  });

  it("filtre les domaines sur format alphanumérique simple", () => {
    const sp = new URLSearchParams();
    sp.append("domaine", "civil");
    sp.append("domaine", "<script>");
    sp.append("domaine", "travail");
    const q = parseVeilleQuery(sp);
    expect(q.domaines).toEqual(["civil", "travail"]);
  });
});
