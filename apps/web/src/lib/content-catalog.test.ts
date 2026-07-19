import { describe, expect, it } from "vitest";
import { contentCatalog, filterContent, getContentBySlug } from "./content-catalog";

describe("functional content catalog", () => {
  it("ships usable exercise, movement, and stretch content", () => {
    expect(contentCatalog.filter((item) => item.kind === "exercise").length).toBeGreaterThanOrEqual(3);
    expect(contentCatalog.filter((item) => item.kind === "movement").length).toBeGreaterThanOrEqual(3);
    expect(contentCatalog.filter((item) => item.kind === "stretch").length).toBeGreaterThanOrEqual(3);
    for (const item of contentCatalog) {
      expect(item.steps.length).toBeGreaterThanOrEqual(3);
      expect(item.primaryMuscles.length).toBeGreaterThan(0);
      expect(item.joints.length).toBeGreaterThan(0);
      expect(item.cautions.length).toBeGreaterThan(0);
    }
  });

  it("filters by Korean or English search, category, equipment, and difficulty", () => {
    expect(filterContent(contentCatalog, { kind: "exercise", query: "squat" }).map((item) => item.slug)).toContain("squat");
    expect(filterContent(contentCatalog, { kind: "stretch", query: "대퇴사두근" }).map((item) => item.slug)).toContain("quadriceps-stretch");
    expect(filterContent(contentCatalog, { kind: "exercise", equipment: "바벨", difficulty: "중급" }).every((item) => item.equipment.includes("바벨") && item.difficulty === "중급")).toBe(true);
    expect(filterContent(contentCatalog, { kind: "movement", category: "보행" }).every((item) => item.category === "보행")).toBe(true);
  });

  it("resolves a stable detail URL slug", () => {
    const squat = getContentBySlug("exercise", "squat");
    expect(squat?.nameKo).toBe("스쿼트");
    expect(getContentBySlug("exercise", "missing")).toBeNull();
  });
});
