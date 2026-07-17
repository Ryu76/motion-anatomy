import { describe, expect, it } from "vitest";
import { getMuscleDeformation } from "./muscle-deformation";

describe("muscle contraction deformation", () => {
  it("makes concentric contraction shorter, thicker, and more pennated", () => {
    const rest = getMuscleDeformation("rest");
    const contracted = getMuscleDeformation("concentric");

    expect(contracted.lengthScale).toBeLessThan(rest.lengthScale);
    expect(contracted.radiusScale).toBeGreaterThan(rest.radiusScale);
    expect(contracted.pennationScale).toBeGreaterThan(rest.pennationScale);
  });

  it("makes eccentric contraction longer and narrower while preserving volume approximately", () => {
    const stretched = getMuscleDeformation("eccentric");

    expect(stretched.lengthScale).toBeGreaterThan(1);
    expect(stretched.radiusScale).toBeLessThan(1);
    expect(stretched.lengthScale * stretched.radiusScale ** 2).toBeCloseTo(1, 1);
  });
});
