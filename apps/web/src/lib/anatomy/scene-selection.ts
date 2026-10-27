import { Color, Mesh, MeshStandardMaterial, Object3D } from "three";

export type NodeCodeMap = ReadonlyMap<string, string>;
export type SelectionState = { selectedId: string | null; hoveredId: string | null; isolate: boolean };
type SelectionMaterialState = { color: Color; emissive: Color; emissiveIntensity: number };
type CachedSelection = {
  meshesByCode: Map<string, Mesh[]>;
  allMeshes: Mesh[];
  previous: SelectionState;
};

export function createMuscleNodeCodeMap(structures: ReadonlyArray<{ structure_type: string; model_node_name: string; code: string }>): Map<string, string> {
  const mapping = new Map<string, string>();
  for (const structure of structures) {
    if (structure.structure_type !== "muscle") continue;
    if (mapping.has(structure.model_node_name)) throw new Error(`Duplicate muscle model node: ${structure.model_node_name}`);
    mapping.set(structure.model_node_name, structure.code);
  }
  return mapping;
}

export function isIndividuallySelectable(code: string | null | undefined, nodeCodes: NodeCodeMap) {
  return Boolean(code && [...nodeCodes.values()].includes(code));
}

export function resolveSelectableStructure(object: Object3D, nodeCodes: NodeCodeMap) {
  let current: Object3D | null = object;
  while (current) {
    const code = nodeCodes.get(current.name);
    if (code) return code;
    current = current.parent;
  }
  return null;
}

function materialState(material: MeshStandardMaterial): SelectionMaterialState {
  if (!material.userData.selectionBase) {
    material.userData.selectionBase = { color: material.color.clone(), emissive: material.emissive.clone(), emissiveIntensity: material.emissiveIntensity } satisfies SelectionMaterialState;
  }
  return material.userData.selectionBase as SelectionMaterialState;
}

function updateMeshHighlight(mesh: Mesh, selectedId: string | null, hoveredId: string | null, code: string) {
  const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).filter((value): value is MeshStandardMaterial => value instanceof MeshStandardMaterial);
  for (const material of materials) {
    const base = materialState(material);
    material.color.copy(base.color);
    material.emissive.copy(base.emissive);
    material.emissiveIntensity = base.emissiveIntensity;
    if (code === selectedId) {
      material.color.set("#00d9d0");
      material.emissive.set("#007f7a");
      material.emissiveIntensity = 0.82;
    } else if (code === hoveredId) {
      material.color.set("#f2a93b");
      material.emissive.set("#a95d00");
      material.emissiveIntensity = 0.45;
    }
  }
}

function cacheSelection(scene: Object3D, nodeCodes: NodeCodeMap): CachedSelection {
  const meshesByCode = new Map<string, Mesh[]>();
  const allMeshes: Mesh[] = [];
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    allMeshes.push(node);
    const code = resolveSelectableStructure(node, nodeCodes);
    if (!code) return;
    const meshes = meshesByCode.get(code) ?? [];
    meshes.push(node);
    meshesByCode.set(code, meshes);
  });
  const cache: CachedSelection = { meshesByCode, allMeshes, previous: { selectedId: null, hoveredId: null, isolate: false } };
  scene.userData.muscleSelectionCache = cache;
  return cache;
}

/** Applies only changed mesh materials on hover; full mesh visibility changes only for isolate transitions. */
export function applySceneSelection(scene: Object3D, state: SelectionState, nodeCodes: NodeCodeMap) {
  const cache = scene.userData.muscleSelectionCache as CachedSelection | undefined;
  const selection = cache ?? cacheSelection(scene, nodeCodes);
  const previous = selection.previous;
  const isolateChanged = state.isolate !== previous.isolate || state.selectedId !== previous.selectedId;
  if (state.isolate && isolateChanged) {
    for (const mesh of selection.allMeshes) {
      const code = resolveSelectableStructure(mesh, nodeCodes);
      mesh.visible = code === state.selectedId;
    }
  } else if (!state.isolate && previous.isolate) {
    for (const mesh of selection.allMeshes) mesh.visible = true;
  }
  const changedCodes = new Set([previous.selectedId, previous.hoveredId, state.selectedId, state.hoveredId].filter((code): code is string => Boolean(code)));
  for (const code of changedCodes) {
    for (const mesh of selection.meshesByCode.get(code) ?? []) updateMeshHighlight(mesh, state.selectedId, state.hoveredId, code);
  }
  selection.previous = { ...state };
}
