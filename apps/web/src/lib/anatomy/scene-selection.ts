import { Color, Mesh, MeshStandardMaterial, Object3D } from "three";

export const selectableNodeCodes = new Set([
  "MUSCLE_GLUTEUS_MAXIMUS_L",
  "MUSCLE_GLUTEUS_MAXIMUS_R",
  "MUSCLE_RECTUS_FEMORIS_L",
  "MUSCLE_RECTUS_FEMORIS_R",
]);

export function isIndividuallySelectable(code: string | null | undefined) {
  return Boolean(code && selectableNodeCodes.has(code));
}

export function resolveSelectableStructure(object: Object3D) {
  let current: Object3D | null = object;
  while (current) {
    if (selectableNodeCodes.has(current.name)) return current.name;
    current = current.parent;
  }
  return null;
}

type SelectionState = { selectedId: string | null; hoveredId: string | null; isolate: boolean };

type SelectionMaterialState = { emissive: Color; emissiveIntensity: number };

function materialState(material: MeshStandardMaterial): SelectionMaterialState {
  if (!material.userData.selectionBase) {
    material.userData.selectionBase = { emissive: material.emissive.clone(), emissiveIntensity: material.emissiveIntensity } satisfies SelectionMaterialState;
  }
  return material.userData.selectionBase as SelectionMaterialState;
}

export function applySceneSelection(scene: Object3D, state: SelectionState) {
  const individualIsolation = state.isolate && isIndividuallySelectable(state.selectedId);
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const code = resolveSelectableStructure(node);
    node.visible = !individualIsolation || code === state.selectedId;
    const materials = (Array.isArray(node.material) ? node.material : [node.material]).filter((value): value is MeshStandardMaterial => value instanceof MeshStandardMaterial);
    for (const material of materials) {
      const base = materialState(material);
      material.emissive.copy(base.emissive);
      material.emissiveIntensity = base.emissiveIntensity;
      if (code === state.selectedId) {
        material.emissive.set("#25d9c2"); material.emissiveIntensity = 0.52;
      } else if (code === state.hoveredId) {
        material.emissive.set("#e7c864"); material.emissiveIntensity = 0.25;
      }
      material.needsUpdate = true;
    }
  });
}
