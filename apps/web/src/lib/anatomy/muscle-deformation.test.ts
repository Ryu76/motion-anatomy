import { describe, expect, it } from "vitest";
import { getMotionFrame, getMuscleDeformation } from "./muscle-deformation";

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

describe("continuous anatomical muscle motion", () => {
  it("flows through shortening and lengthening in one loop", () => {
    expect(getMotionFrame(0).phase).toBe("rest");
    expect(getMotionFrame(0.25).phase).toBe("concentric");
    expect(getMotionFrame(0.5).phase).toBe("rest");
    expect(getMotionFrame(0.75).phase).toBe("eccentric");
    expect(getMotionFrame(1).phase).toBe("rest");
  });

  it("interpolates without jumping between named states", () => {
    const early = getMotionFrame(0.1).deformation;
    const peak = getMotionFrame(0.25).deformation;
    expect(early.lengthScale).toBeLessThan(1);
    expect(early.lengthScale).toBeGreaterThan(peak.lengthScale);
    expect(early.radiusScale).toBeGreaterThan(1);
    expect(early.radiusScale).toBeLessThan(peak.radiusScale);
  });
});
