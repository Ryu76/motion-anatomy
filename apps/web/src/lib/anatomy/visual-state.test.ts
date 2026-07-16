import { expect, it } from "vitest";
import { getStructureVisualState } from "./visual-state";

it("makes a selected structure opaque and visually prominent", () => {
  expect(getStructureVisualState({ selected: true, hovered: false, dimOthers: true })).toEqual({
    color: "#ff5c7a", emissive: "#7d1935", emissiveIntensity: 0.9, opacity: 1, transparent: false
  });
});

it("dims unselected structures without making them unclickable", () => {
  const state = getStructureVisualState({ selected: false, hovered: false, dimOthers: true });
  expect(state.opacity).toBe(0.18);
  expect(state.transparent).toBe(true);
});
