"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Group, MathUtils, Vector3 } from "three";
import type { AnatomyStructure, StructureType } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { getStructureVisualState } from "@/lib/anatomy/visual-state";
import { getMuscleDeformation } from "@/lib/anatomy/muscle-deformation";
import { ZAnatomyReferenceModel } from "./ZAnatomyReferenceModel";

const colors: Record<StructureType, string> = {
  bone: "#e5dfcf",
  muscle: "#b92f43",
  tendon: "#d7cfae",
  ligament: "#e7b951",
  fascia: "#8baee8",
};

const positions: Record<string, [number, number, number]> = {
  BONE_SKULL: [0, 2.58, 0],
  BONE_FEMUR_L: [-0.28, -0.79, 0],
  BONE_FEMUR_R: [0.28, -0.79, 0],
  MUSCLE_GLUTEUS_MAXIMUS_L: [-0.31, 0.02, -0.22],
  MUSCLE_GLUTEUS_MAXIMUS_R: [0.31, 0.02, -0.22],
  MUSCLE_RECTUS_FEMORIS_L: [-0.29, -0.72, 0.16],
  MUSCLE_RECTUS_FEMORIS_R: [0.29, -0.72, 0.16],
  TENDON_ACHILLES_L: [-0.28, -1.91, -0.08],
  LIGAMENT_ACL_L: [-0.28, -1.35, 0.08],
  FASCIA_THORACOLUMBAR: [0, 0.92, -0.25],
};

function buildRectusFibers(pennation: number) {
  return Array.from({ length: 18 }, (_, index) => {
    const side = index % 2 === 0 ? 1 : -1;
    const row = Math.floor(index / 2);
    const y = -0.4 + row * 0.1;
    const rise = 0.085 * pennation;
    return new CatmullRomCurve3([
      new Vector3(side * 0.095, y - rise, 0.075),
      new Vector3(side * 0.055, y, 0.12),
      new Vector3(side * 0.014, y + rise, 0.125),
    ]);
  });
}

function buildGluteFibers(pennation: number) {
  return Array.from({ length: 24 }, (_, index) => {
    const ratio = index / 23 - 0.5;
    const startX = ratio * 0.5;
    const startY = 0.29 - Math.abs(ratio) * 0.14;
    const endX = 0.13 + ratio * 0.08;
    const endY = -0.31 + ratio * 0.08;
    const sweep = ratio * 0.05 * pennation;
    return new CatmullRomCurve3([
      new Vector3(startX, startY, -0.08),
      new Vector3(startX * 0.72 + sweep, 0.1, -0.185 + Math.abs(ratio) * 0.05),
      new Vector3((startX + endX) * 0.35, -0.12, -0.19 + Math.abs(ratio) * 0.045),
      new Vector3(endX, endY, -0.075),
    ]);
  });
}

type MuscleProps = {
  structure: AnatomyStructure;
  kind: "gluteus" | "rectus";
  position: [number, number, number];
  visual: ReturnType<typeof getStructureVisualState>;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
};

function DetailedMuscle({ structure, kind, position, visual, onSelect, onHover }: MuscleProps) {
  const mode = useViewerStore((state) => state.contractionMode);
  const deformation = getMuscleDeformation(mode);
  const animated = useRef<Group>(null);
  const fibers = useMemo(
    () => kind === "gluteus" ? buildGluteFibers(deformation.pennationScale) : buildRectusFibers(deformation.pennationScale),
    [kind, deformation.pennationScale],
  );
  const side = structure.side === "right" ? -1 : 1;

  useFrame((_, delta) => {
    if (!animated.current) return;
    animated.current.scale.x = MathUtils.damp(animated.current.scale.x, deformation.radiusScale, 7, delta);
    animated.current.scale.y = MathUtils.damp(animated.current.scale.y, deformation.lengthScale, 7, delta);
    animated.current.scale.z = MathUtils.damp(animated.current.scale.z, deformation.radiusScale, 7, delta);
  });

  return (
    <group
      name={structure.model_node_name}
      position={position}
      scale={[side, 1, 1]}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerOver={(event) => { event.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}
    >
      <group ref={animated}>
        <mesh castShadow receiveShadow scale={kind === "gluteus" ? [0.38, 0.42, 0.2] : [0.14, 1, 0.13]}>
          {kind === "gluteus" ? <sphereGeometry args={[1, 56, 40]} /> : <capsuleGeometry args={[0.72, 0.78, 16, 40]} />}
          <meshStandardMaterial color={deformation.color} roughness={0.64} metalness={0.01} transparent opacity={visual.opacity * 0.36} depthWrite={false} emissive={visual.emissive} emissiveIntensity={visual.emissiveIntensity} />
        </mesh>
        {fibers.map((curve, index) => (
          <mesh key={index} castShadow>
            <tubeGeometry args={[curve, kind === "gluteus" ? 28 : 12, kind === "gluteus" ? (index % 4 === 0 ? 0.008 : 0.005) : 0.0045, 6, false]} />
            <meshStandardMaterial color={index % 3 === 0 ? "#f58a83" : "#751b29"} roughness={0.62} transparent opacity={visual.opacity * (index % 3 === 0 ? 0.96 : 0.84)} depthWrite={false} emissive={mode === "concentric" ? "#7a1722" : "#26060a"} emissiveIntensity={deformation.fiberTension * 0.45} />
          </mesh>
        ))}
        {kind === "rectus" && <mesh position={[0, 0, 0.128]}>
          <boxGeometry args={[0.018, 0.78, 0.01]} />
          <meshStandardMaterial color="#d9a69c" roughness={0.82} transparent opacity={visual.opacity * 0.9} depthWrite={false} />
        </mesh>}
      </group>
    </group>
  );
}

export function SampleHumanModel({ structures }: { structures: AnatomyStructure[] }) {
  const selected = useViewerStore((state) => state.selectedStructureId);
  const hovered = useViewerStore((state) => state.hoveredStructureId);
  const visibility = useViewerStore((state) => state.layerVisibility);
  const sex = useViewerStore((state) => state.sexModel);
  const select = useViewerStore((state) => state.selectStructure);
  const hover = useViewerStore((state) => state.hoverStructure);
  const isolate = useViewerStore((state) => state.isolateMode);
  const dimOthers = selected !== null;

  return (
    <group scale={sex === "female" ? [0.95, 0.98, 0.93] : [1, 1, 1]}>
      <ZAnatomyReferenceModel />
      {structures.map((structure) => {
        if (!visibility[structure.structure_type] || (isolate && selected && selected !== structure.code)) return null;
        const visual = getStructureVisualState({
          selected: selected === structure.code,
          hovered: hovered === structure.code,
          dimOthers,
          baseColor: colors[structure.structure_type],
        });
        const position = positions[structure.code] ?? [0, 0, 0];
        if (structure.code.startsWith("MUSCLE_GLUTEUS")) {
          return <DetailedMuscle key={structure.code} structure={structure} kind="gluteus" position={position} visual={visual} onSelect={() => select(structure.code)} onHover={(state) => hover(state ? structure.code : null)} />;
        }
        if (structure.code.startsWith("MUSCLE_RECTUS")) {
          return <DetailedMuscle key={structure.code} structure={structure} kind="rectus" position={position} visual={visual} onSelect={() => select(structure.code)} onHover={(state) => hover(state ? structure.code : null)} />;
        }
        return null;
      })}
    </group>
  );
}
