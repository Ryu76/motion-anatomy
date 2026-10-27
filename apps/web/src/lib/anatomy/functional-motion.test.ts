import { describe, expect, it } from "vitest";
import { advanceMotionProgress, getFunctionalMotionFrame, getFunctionalTargetStates, getMorphWeights } from "./functional-motion";
import { contentCatalog } from "@/lib/content-catalog";

describe("functional anatomy motion contracts", () => {
  it("derives every viewer target from its catalog item's real mesh-backed muscle codes", () => {
    for (const item of contentCatalog) {
      expect(item.motionProfile).toBeTruthy();
      const states = getFunctionalTargetStates(item, 0.25);
      expect(states.map((state) => state.code)).toEqual(item.relatedStructureCodes.filter((code) => code.startsWith("MUSCLE_")));
      expect(states.length).toBeGreaterThan(0);
      expect(states.every((state) => state.label.length > 0 && state.nameKo.length > 0)).toBe(true);
    }
  });

  it("advances a functional replay only after the user explicitly presses play", () => {
    expect(advanceMotionProgress(0.25, 1000, false)).toBe(0.25);
    expect(advanceMotionProgress(0.25, 1000, true)).toBeGreaterThan(0.25);
  });

  it("never requests shape-key deformation from a mesh without the original Shorten and Lengthen targets", () => {
    expect(getMorphWeights([], { mode: "concentric", morph: 1 })).toEqual({ shorten: 0, lengthen: 0 });
    expect(getMorphWeights(["Shorten"], { mode: "concentric", morph: 0.6 })).toEqual({ shorten: 0, lengthen: 0 });
    expect(getMorphWeights(["Shorten", "Lengthen"], { mode: "passive-stretch", morph: 0.6 })).toEqual({ shorten: 0, lengthen: 0.6 });
  });

  it("keeps every mapped state at zero weight when its mesh lacks either original shape key", () => {
    for (const item of contentCatalog) {
      for (const state of getFunctionalTargetStates(item, 0.25)) {
        expect(getMorphWeights([], state)).toEqual({ shorten: 0, lengthen: 0 });
        expect(getMorphWeights(["Shorten"], state)).toEqual({ shorten: 0, lengthen: 0 });
        expect(getMorphWeights(["Lengthen"], state)).toEqual({ shorten: 0, lengthen: 0 });
      }
    }
  });


  it("synchronizes eccentric descent and concentric ascent for real target muscle morphs", () => {
    const descent = getFunctionalMotionFrame("squat", 0.25);
    const ascent = getFunctionalMotionFrame("squat", 0.75);
    expect(descent.phaseLabel).toBe("하강");
    expect(descent.tissues.gluteus.mode).toBe("eccentric");
    expect(descent.tissues.rectusFemoris.mode).toBe("eccentric");
    expect(ascent.phaseLabel).toBe("상승");
    expect(ascent.tissues.gluteus.mode).toBe("concentric");
    expect(ascent.tissues.rectusFemoris.mode).toBe("concentric");
  });

  it("describes fascia only as passive tension, stretch, or release", () => {
    for (const motion of ["squat", "walking", "quadriceps-stretch"] as const) {
      const fascia = getFunctionalMotionFrame(motion, 0.5).tissues.fascia;
      expect(["passive-tension", "passive-stretch", "release"]).toContain(fascia.mode);
      expect(fascia.label).not.toMatch(/수축/);
    }
  });

  it("retains phase labels and maps alternating gait and a unilateral quadriceps stretch", () => {
    const gaitA = getFunctionalMotionFrame("walking", 0.25);
    const gaitB = getFunctionalMotionFrame("walking", 0.75);
    expect(gaitA.phaseLabel).toBe("왼쪽 전진 · 오른쪽 지지");
    expect(gaitB.phaseLabel).toBe("오른쪽 전진 · 왼쪽 지지");
    const stretch = getFunctionalMotionFrame("quadriceps-stretch", 0.5);
    expect(stretch.tissues.rectusFemoris.mode).toBe("passive-stretch");
  });
});
