import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type ManifestMuscle = { model_node_name: string; source_name: string; vertices: number; triangles: number; morph_targets: string[] };
type Manifest = { asset_bytes: number; asset_sha256: string; muscle_count: number; node_names: string[]; muscles: ManifestMuscle[] };
type Seed = { code: string; model_node_name: string; structure_type: string; name_ko: string; name_en: string; name_latin: string | null; search_terms?: string[]; depth: string };

const repositoryRoot = path.resolve(process.cwd(), "../..");
const manifest = JSON.parse(readFileSync(path.join(repositoryRoot, "data/generated/z-anatomy-muscles-manifest.json"), "utf8")) as Manifest;
const seeds = JSON.parse(readFileSync(path.join(repositoryRoot, "data/seed/anatomy_structures.json"), "utf8")) as Seed[];
const glb = readFileSync(path.join(repositoryRoot, "apps/web/public/models/z-anatomy/z-anatomy-muscles-detailed.glb"));

describe("Z-Anatomy muscle asset contract", () => {
  it("has a complete, geometry-backed one-to-one muscle seed mapping without a merged static node", () => {
    const muscleSeeds = seeds.filter((item) => item.structure_type === "muscle");
    expect(manifest.muscle_count).toBe(manifest.muscles.length);
    expect(new Set(manifest.node_names).size).toBe(manifest.muscle_count);
    expect(new Set(muscleSeeds.map((item) => item.code)).size).toBe(manifest.muscle_count);
    expect(new Set(muscleSeeds.map((item) => item.model_node_name)).size).toBe(manifest.muscle_count);
    expect(new Set(muscleSeeds.map((item) => item.model_node_name))).toEqual(new Set(manifest.node_names));
    expect(manifest.node_names).not.toContain("MUSCLE_SYSTEM_STATIC");
    expect(manifest.muscles.every((item) => item.vertices > 0 && item.triangles > 0)).toBe(true);
    expect(createHash("sha256").update(glb).digest("hex")).toBe(manifest.asset_sha256);
    expect(glb.byteLength).toBe(manifest.asset_bytes);
  });

  it("retains morph targets only on the four animated muscles", () => {
    const morphMeshes = manifest.muscles.filter((item) => item.morph_targets.length > 0).sort((a, b) => a.model_node_name.localeCompare(b.model_node_name));
    expect(morphMeshes.map((item) => item.model_node_name)).toEqual([
      "MUSCLE_GLUTEUS_MAXIMUS_L", "MUSCLE_GLUTEUS_MAXIMUS_R", "MUSCLE_RECTUS_FEMORIS_L", "MUSCLE_RECTUS_FEMORIS_R",
    ]);
    expect(morphMeshes.every((item) => item.morph_targets.includes("Shorten") && item.morph_targets.includes("Lengthen"))).toBe(true);
  });

  it("curates searchable deep iliopsoas components from actual exported nodes", () => {
    const records = new Map(seeds.map((item) => [item.code, item]));
    for (const code of ["MUSCLE_PSOAS_MAJOR_L", "MUSCLE_PSOAS_MAJOR_R", "MUSCLE_ILIACUS_MUSCLE_L", "MUSCLE_ILIACUS_MUSCLE_R"]) {
      const record = records.get(code);
      expect(record).toBeDefined();
      expect(manifest.node_names).toContain(code);
      expect(record?.depth).toBe("deep");
      expect(record?.name_ko).not.toBe("");
      expect(record?.name_en).not.toBe("");
      expect(record?.name_latin).not.toBeNull();
      expect(record?.search_terms).toEqual(["장요근"]);
      expect(record?.name_ko).not.toBe("장요근");
    }
  });

  it("gives every mesh-backed muscle a Korean primary display name without changing source codes or the GLB", () => {
    const muscleSeeds = seeds.filter((item) => item.structure_type === "muscle");
    expect(muscleSeeds).toHaveLength(462);
    for (const record of muscleSeeds) {
      expect(record.name_ko).toMatch(/[가-힣]/);
      expect(record.name_ko).not.toBe(record.name_en);
      expect(manifest.node_names).toContain(record.code);
    }
    expect(createHash("sha256").update(glb).digest("hex")).toBe(manifest.asset_sha256);
  });
});
