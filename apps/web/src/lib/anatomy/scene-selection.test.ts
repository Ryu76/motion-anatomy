import { describe, expect, it } from "vitest";
import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { applySceneSelection, resolveSelectableStructure } from "./scene-selection";

function target(name: string) {
  const mesh = new Mesh(new SphereGeometry(1), new MeshStandardMaterial({ color: "#9f3342" }));
  mesh.name = name;
  return mesh;
}

describe("3D scene selection", () => {
  it("resolves a selectable anatomy node through its parent chain", () => {
    const parent = target("MUSCLE_GLUTEUS_MAXIMUS_L");
    const child = new Group(); parent.add(child);
    expect(resolveSelectableStructure(child)).toBe("MUSCLE_GLUTEUS_MAXIMUS_L");
  });

  it("isolates only the selected independent muscle mesh", () => {
    const root = new Group();
    const left = target("MUSCLE_GLUTEUS_MAXIMUS_L");
    const right = target("MUSCLE_GLUTEUS_MAXIMUS_R");
    const merged = target("BODY_MUSCLES_MERGED");
    root.add(left, right, merged);
    applySceneSelection(root, { selectedId: left.name, hoveredId: null, isolate: true });
    expect(left.visible).toBe(true);
    expect(right.visible).toBe(false);
    expect(merged.visible).toBe(false);
  });

  it("highlights selected and hovered anatomy using actual mesh materials", () => {
    const root = new Group();
    const selected = target("MUSCLE_GLUTEUS_MAXIMUS_L");
    const hovered = target("MUSCLE_GLUTEUS_MAXIMUS_R");
    root.add(selected, hovered);
    applySceneSelection(root, { selectedId: selected.name, hoveredId: hovered.name, isolate: false });
    const selectedMaterial = selected.material as MeshStandardMaterial;
    const hoveredMaterial = hovered.material as MeshStandardMaterial;
    expect(selectedMaterial.emissive.getHex()).not.toBe(0);
    expect(selectedMaterial.emissiveIntensity).toBeGreaterThan(hoveredMaterial.emissiveIntensity);
  });
});
