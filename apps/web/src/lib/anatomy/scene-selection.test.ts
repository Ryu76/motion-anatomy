import { describe, expect, it } from "vitest";
import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { applySceneSelection, createMuscleNodeCodeMap, resolveSelectableStructure } from "./scene-selection";

const nodeCodes = createMuscleNodeCodeMap([
  { structure_type: "muscle", model_node_name: "MUSCLE_GLUTEUS_MAXIMUS_L", code: "MUSCLE_GLUTEUS_MAXIMUS_L" },
  { structure_type: "muscle", model_node_name: "MUSCLE_GLUTEUS_MAXIMUS_R", code: "MUSCLE_GLUTEUS_MAXIMUS_R" },
  { structure_type: "muscle", model_node_name: "MUSCLE_PSOAS_MAJOR_L", code: "MUSCLE_PSOAS_MAJOR_L" },
  { structure_type: "muscle", model_node_name: "MUSCLE_ILIACUS_MUSCLE_R", code: "MUSCLE_ILIACUS_MUSCLE_R" },
]);

function target(name: string) {
  const mesh = new Mesh(new SphereGeometry(1), new MeshStandardMaterial({ color: "#9f3342" }));
  mesh.name = name;
  return mesh;
}

describe("3D scene selection", () => {
  it("resolves a source-derived muscle node through its parent chain", () => {
    const parent = target("MUSCLE_PSOAS_MAJOR_L");
    const child = new Group(); parent.add(child);
    expect(resolveSelectableStructure(child, nodeCodes)).toBe("MUSCLE_PSOAS_MAJOR_L");
  });

  it("isolates psoas and iliacus meshes from the runtime seed mapping", () => {
    const root = new Group();
    const psoas = target("MUSCLE_PSOAS_MAJOR_L");
    const iliacus = target("MUSCLE_ILIACUS_MUSCLE_R");
    root.add(psoas, iliacus);
    applySceneSelection(root, { selectedId: "MUSCLE_PSOAS_MAJOR_L", hoveredId: null, isolate: true }, nodeCodes);
    expect(psoas.visible).toBe(true);
    expect(iliacus.visible).toBe(false);
  });

  it("uses stable high-contrast selected and distinct hover colors, then restores exact material state", () => {
    const root = new Group();
    const selected = target("MUSCLE_PSOAS_MAJOR_L");
    const hovered = target("MUSCLE_ILIACUS_MUSCLE_R");
    root.add(selected, hovered);
    const baseColor = (selected.material as MeshStandardMaterial).color.clone();
    const baseEmissive = (selected.material as MeshStandardMaterial).emissive.clone();
    const baseIntensity = (selected.material as MeshStandardMaterial).emissiveIntensity;
    applySceneSelection(root, { selectedId: selected.name, hoveredId: hovered.name, isolate: false }, nodeCodes);
    const selectedMaterial = selected.material as MeshStandardMaterial;
    const hoveredMaterial = hovered.material as MeshStandardMaterial;
    expect(selectedMaterial.color.getHexString()).toBe("00d9d0");
    expect(selectedMaterial.emissive.getHexString()).toBe("007f7a");
    expect(selectedMaterial.emissiveIntensity).toBeGreaterThan(0.7);
    expect(selectedMaterial.color.getHex()).not.toBe(0xffffff);
    expect(hoveredMaterial.color.getHexString()).toBe("f2a93b");
    expect(selectedMaterial.emissiveIntensity).toBeGreaterThan(hoveredMaterial.emissiveIntensity);
    applySceneSelection(root, { selectedId: null, hoveredId: null, isolate: false }, nodeCodes);
    expect(selectedMaterial.color.equals(baseColor)).toBe(true);
    expect(selectedMaterial.emissive.equals(baseEmissive)).toBe(true);
    expect(selectedMaterial.emissiveIntensity).toBe(baseIntensity);
  });
});
