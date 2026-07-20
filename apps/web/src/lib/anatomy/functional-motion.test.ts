import { describe, expect, it } from "vitest";
import { deformAnatomyPoint, getFunctionalMotionFrame } from "./functional-motion";

describe("functional anatomy motion contracts", () => {
  it("moves the pelvis, thigh, and lower leg continuously through a squat", () => {
    const standing = getFunctionalMotionFrame("squat", 0);
    const descent = getFunctionalMotionFrame("squat", 0.25);
    const bottom = getFunctionalMotionFrame("squat", 0.5);
    const ascent = getFunctionalMotionFrame("squat", 0.75);
    expect(standing.poseDepth).toBe(0);
    expect(descent.poseDepth).toBeGreaterThan(0);
    expect(bottom.poseDepth).toBe(1);
    expect(ascent.poseDepth).toBeCloseTo(descent.poseDepth);
    expect(bottom.joints.hipFlexion).toBeGreaterThan(descent.joints.hipFlexion);
    expect(bottom.joints.kneeFlexion).toBeGreaterThan(descent.joints.kneeFlexion);
    expect(deformAnatomyPoint([0.1, 0.9, 0], "squat", 0.5)[1]).toBeLessThan(0.9);
    expect(deformAnatomyPoint([0.1, 0.45, 0], "squat", 0.5)).not.toEqual([0.1, 0.45, 0]);
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

  it("drives alternating gait and a unilateral quadriceps stretch", () => {
    const gaitA = getFunctionalMotionFrame("walking", 0.25);
    const gaitB = getFunctionalMotionFrame("walking", 0.75);
    expect(gaitA.joints.leftHipFlexion).toBeGreaterThan(0);
    expect(gaitB.joints.leftHipFlexion).toBeLessThan(0);
    const stretch = getFunctionalMotionFrame("quadriceps-stretch", 0.5);
    expect(stretch.joints.leftKneeFlexion).toBeGreaterThan(100);
    expect(stretch.tissues.rectusFemoris.mode).toBe("passive-stretch");
  });
});
