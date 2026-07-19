import { describe, expect, it } from "vitest";
import { getStructureFocus } from "./camera-focus";

describe("structure camera framing", () => {
  it("centers the head with a close view", () => {
    expect(getStructureFocus({ body_region: "head", side: "midline" })).toEqual({ target: [0, 1.42, 0], distance: 3.35 });
  });
  it("centers left pelvic anatomy with a lateral offset", () => {
    expect(getStructureFocus({ body_region: "pelvis", side: "left" })).toEqual({ target: [-0.34, -0.22, 0], distance: 3.7 });
  });
  it("returns a full body focus without a selection", () => {
    expect(getStructureFocus(null)).toEqual({ target: [0, 0.35, 0], distance: 5.8 });
  });
});
