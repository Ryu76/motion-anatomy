"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Color, Mesh, MeshStandardMaterial, Object3D } from "three";
import { useViewerStore } from "@/stores/viewer-store";

const MUSCLE_MODEL_URL = "/models/z-anatomy/z-anatomy-muscular-system.glb";
const SKELETON_MODEL_URL = "/models/z-anatomy/z-anatomy-skeletal-system.glb";

function prepareModel(scene: Object3D, layer: "muscle" | "bone") {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const sources = Array.isArray(node.material) ? node.material : [node.material];
    const materials = sources.map((source) => {
      const material = source instanceof MeshStandardMaterial ? source.clone() : new MeshStandardMaterial();
      if (layer === "bone") {
        material.color = new Color("#ddd8c8");
        material.opacity = 0.96;
        material.roughness = 0.82;
      } else {
        material.color = material.color?.clone() ?? new Color("#a9283c");
        if (material.color.getHSL({ h: 0, s: 0, l: 0 }).s < 0.12) material.color.set("#a93645");
        material.opacity = 0.86;
        material.roughness = 0.72;
      }
      material.metalness = 0;
      material.transparent = true;
      material.depthWrite = true;
      return material;
    });
    node.material = materials.length === 1 ? materials[0] : materials;
    node.castShadow = true;
    node.receiveShadow = true;
  });
  return clone;
}

export function ZAnatomyReferenceModel() {
  const muscleAsset = useGLTF(MUSCLE_MODEL_URL, "/draco/");
  const skeletonAsset = useGLTF(SKELETON_MODEL_URL, "/draco/");
  const muscleVisible = useViewerStore((state) => state.layerVisibility.muscle);
  const boneVisible = useViewerStore((state) => state.layerVisibility.bone);
  const isolate = useViewerStore((state) => state.isolateMode);
  const muscles = useMemo(() => prepareModel(muscleAsset.scene, "muscle"), [muscleAsset.scene]);
  const skeleton = useMemo(() => prepareModel(skeletonAsset.scene, "bone"), [skeletonAsset.scene]);

  if (isolate) return null;
  return <group name="Z-Anatomy reference systems" scale={2.46} position={[0, -2.15, 0]}>
    {boneVisible && <primitive object={skeleton} name="Z-Anatomy skeletal system" />}
    {muscleVisible && <primitive object={muscles} name="Z-Anatomy muscular system" />}
  </group>;
}

useGLTF.preload(MUSCLE_MODEL_URL, "/draco/");
useGLTF.preload(SKELETON_MODEL_URL, "/draco/");
