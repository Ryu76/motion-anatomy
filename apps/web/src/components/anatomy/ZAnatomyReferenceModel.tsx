"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Color, Mesh, MeshStandardMaterial, Object3D } from "three";
import type { StructureType } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { getMotionFrame } from "@/lib/anatomy/muscle-deformation";

const urls: Record<StructureType, string> = {
  bone: "/models/z-anatomy/z-anatomy-skeletal-system.glb",
  muscle: "/models/z-anatomy/z-anatomy-muscles-detailed.glb",
  tendon: "/models/z-anatomy/z-anatomy-tendons.glb",
  ligament: "/models/z-anatomy/z-anatomy-ligaments.glb",
  fascia: "/models/z-anatomy/z-anatomy-fascia.glb",
  vessel: "/models/z-anatomy/z-anatomy-vessels.glb",
};

const targetNodeToStructure: Record<string, string> = {
  MUSCLE_GLUTEUS_MAXIMUS_L: "MUSCLE_GLUTEUS_MAXIMUS_L",
  MUSCLE_GLUTEUS_MAXIMUS_R: "MUSCLE_GLUTEUS_MAXIMUS_R",
  MUSCLE_RECTUS_FEMORIS_L: "MUSCLE_RECTUS_FEMORIS_L",
  MUSCLE_RECTUS_FEMORIS_R: "MUSCLE_RECTUS_FEMORIS_R",
};

const fallbackColors: Record<StructureType, string> = {
  bone: "#ddd8c8",
  muscle: "#a93645",
  tendon: "#ded5b7",
  ligament: "#e2b957",
  fascia: "#779bd8",
  vessel: "#d93650",
};

function prepareModel(scene: Object3D, layer: StructureType) {
  const clone = scene.clone(true);
  clone.name = `Z-Anatomy ${layer} layer`;
  clone.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const sources = Array.isArray(node.material) ? node.material : [node.material];
    const materials = sources.map((source) => {
      const material = source instanceof MeshStandardMaterial ? source.clone() : new MeshStandardMaterial();
      const hsl = { h: 0, s: 0, l: 0 };
      material.color.getHSL(hsl);
      if (layer === "bone" || hsl.s < 0.06) material.color = new Color(fallbackColors[layer]);
      material.metalness = 0;
      material.roughness = layer === "vessel" ? 0.56 : 0.76;
      return material;
    });
    node.material = materials.length === 1 ? materials[0] : materials;
    node.castShadow = layer !== "vessel";
    node.receiveShadow = true;
  });
  return clone;
}

function applyOpacity(scene: Object3D, opacity: number) {
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      material.opacity = opacity;
      material.transparent = opacity < 0.995;
      material.depthWrite = opacity > 0.92;
      material.needsUpdate = true;
    }
  });
}

function resolveStructureCode(object: Object3D) {
  let current: Object3D | null = object;
  while (current) {
    if (targetNodeToStructure[current.name]) return targetNodeToStructure[current.name];
    current = current.parent;
  }
  return null;
}

function setMorphInfluence(mesh: Mesh, targetName: string, value: number) {
  const dictionary = mesh.morphTargetDictionary;
  const influences = mesh.morphTargetInfluences;
  const index = dictionary?.[targetName];
  if (index === undefined || !influences) return;
  influences[index] = value;
}

function AnimatedMuscleMorphs({ scene }: { scene: Object3D }) {
  const animatedMeshes = useRef<Mesh[]>([]);
  useEffect(() => {
    const result: Mesh[] = [];
    scene.traverse((node) => {
      if (node instanceof Mesh && targetNodeToStructure[node.name] && node.morphTargetDictionary) result.push(node);
    });
    animatedMeshes.current = result;
  }, [scene]);

  useFrame(() => {
    const frame = getMotionFrame(useViewerStore.getState().motionProgress);
    const shortenWeight = Math.min(1, Math.max(0, (1 - frame.deformation.lengthScale) / 0.18));
    const lengthenWeight = Math.min(1, Math.max(0, (frame.deformation.lengthScale - 1) / 0.18));
    for (const mesh of animatedMeshes.current) {
      setMorphInfluence(mesh, "Shorten", shortenWeight);
      setMorphInfluence(mesh, "Lengthen", lengthenWeight);
    }
  });
  return null;
}

export function ZAnatomyReferenceModel() {
  const boneAsset = useGLTF(urls.bone, "/draco/");
  const muscleAsset = useGLTF(urls.muscle, "/draco/");
  const tendonAsset = useGLTF(urls.tendon, "/draco/");
  const ligamentAsset = useGLTF(urls.ligament, "/draco/");
  const fasciaAsset = useGLTF(urls.fascia, "/draco/");
  const vesselAsset = useGLTF(urls.vessel, "/draco/");
  const visibility = useViewerStore((state) => state.layerVisibility);
  const opacity = useViewerStore((state) => state.layerOpacity);
  const isolate = useViewerStore((state) => state.isolateMode);
  const selectedId = useViewerStore((state) => state.selectedStructureId);
  const select = useViewerStore((state) => state.selectStructure);
  const hover = useViewerStore((state) => state.hoverStructure);

  const models = useMemo(() => ({
    bone: prepareModel(boneAsset.scene, "bone"),
    muscle: prepareModel(muscleAsset.scene, "muscle"),
    tendon: prepareModel(tendonAsset.scene, "tendon"),
    ligament: prepareModel(ligamentAsset.scene, "ligament"),
    fascia: prepareModel(fasciaAsset.scene, "fascia"),
    vessel: prepareModel(vesselAsset.scene, "vessel"),
  }), [boneAsset.scene, muscleAsset.scene, tendonAsset.scene, ligamentAsset.scene, fasciaAsset.scene, vesselAsset.scene]);

  useEffect(() => {
    for (const layer of Object.keys(models) as StructureType[]) applyOpacity(models[layer], opacity[layer]);
  }, [models, opacity]);

  const isolateLayer = selectedId?.split("_")[0].toLowerCase() as StructureType | undefined;
  const shouldShow = (layer: StructureType) => visibility[layer] && (!isolate || isolateLayer === layer);

  return <group name="Z-Anatomy detailed systems" scale={2.46} position={[0, -2.15, 0]}>
    {shouldShow("bone") && <primitive object={models.bone} renderOrder={0} />}
    {shouldShow("ligament") && <primitive object={models.ligament} renderOrder={1} />}
    {shouldShow("vessel") && <primitive object={models.vessel} renderOrder={2} />}
    {shouldShow("tendon") && <primitive object={models.tendon} renderOrder={3} />}
    {shouldShow("muscle") && <primitive
      object={models.muscle}
      renderOrder={4}
      onClick={(event: { stopPropagation: () => void; object: Object3D }) => {
        const code = resolveStructureCode(event.object);
        if (!code) return;
        event.stopPropagation();
        select(code);
      }}
      onPointerOver={(event: { stopPropagation: () => void; object: Object3D }) => {
        const code = resolveStructureCode(event.object);
        if (!code) return;
        event.stopPropagation();
        hover(code);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => { hover(null); document.body.style.cursor = "default"; }}
    />}
    {shouldShow("fascia") && <primitive object={models.fascia} renderOrder={5} />}
    <AnimatedMuscleMorphs scene={models.muscle} />
  </group>;
}

for (const url of Object.values(urls)) useGLTF.preload(url, "/draco/");
