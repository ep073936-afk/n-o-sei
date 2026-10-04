import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { UFS } from "./ufs.js";

const geoJsonPath = new URL("../../public/brazil-ufs.geojson", import.meta.url);
const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, "utf8"));

describe("GeoJSON das UFs", () => {
  it("carrega um FeatureCollection com 27 UFs válidas", () => {
    expect(geoJson.type).toBe("FeatureCollection");
    expect(Array.isArray(geoJson.features)).toBe(true);
    expect(geoJson.features).toHaveLength(27);

    const siglas = geoJson.features.map((feature) => feature.properties?.sigla);
    expect(new Set(siglas).size).toBe(27);

    const validSigs = new Set(UFS.map((uf) => uf.sigla));
    const invalid = geoJson.features.filter((feature) => !validSigs.has(feature.properties?.sigla));

    expect(invalid).toHaveLength(0);
  });

  it("cada UF pertence a uma única região e bate com src/data/ufs.js", () => {
    const regionBySigla = Object.fromEntries(UFS.map((uf) => [uf.sigla, uf.regiao]));
    const seen = new Map();

    for (const feature of geoJson.features) {
      const sigla = feature.properties?.sigla;
      const regiao = feature.properties?.regiao;

      expect(sigla).toBeTruthy();
      expect(regiao).toBeTruthy();
      expect(regionBySigla[sigla]).toBeTruthy();
      expect(regionBySigla[sigla]).toBe(regiao);

      if (seen.has(sigla)) {
        throw new Error(`UF duplicada: ${sigla}`);
      }

      seen.set(sigla, regiao);
    }

    expect(seen.size).toBe(27);
  });
});
