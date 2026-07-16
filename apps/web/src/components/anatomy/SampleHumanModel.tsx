"use client";
import type { AnatomyStructure, StructureType } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { getStructureVisualState } from "@/lib/anatomy/visual-state";

const colors: Record<StructureType, string> = { bone: "#d7e3e8", muscle: "#d94d68", tendon: "#62d6c6", ligament: "#f7c85e", fascia: "#8ca9ff" };
const positions: Record<string, [number, number, number]> = {
  BONE_SKULL: [0, 2.7, 0], BONE_FEMUR_L: [-0.28, -0.72, 0], BONE_FEMUR_R: [0.28, -0.72, 0],
  MUSCLE_GLUTEUS_MAXIMUS_L: [-0.3, 0.03, -0.16], MUSCLE_GLUTEUS_MAXIMUS_R: [0.3, 0.03, -0.16],
  MUSCLE_RECTUS_FEMORIS_L: [-0.3, -0.65, 0.18], MUSCLE_RECTUS_FEMORIS_R: [0.3, -0.65, 0.18],
  TENDON_ACHILLES_L: [-0.28, -1.9, -0.08], LIGAMENT_ACL_L: [-0.28, -1.35, 0.08], FASCIA_THORACOLUMBAR: [0, 1.02, -0.24]
};

function Geometry({ code }: { code: string }) {
  if (code === "BONE_SKULL") return <sphereGeometry args={[0.32, 32, 24]} />;
  if (code.startsWith("BONE_FEMUR")) return <capsuleGeometry args={[0.09, 1.05, 8, 16]} />;
  if (code.startsWith("MUSCLE_GLUTEUS")) return <sphereGeometry args={[0.3, 24, 18]} />;
  if (code.startsWith("MUSCLE_RECTUS")) return <capsuleGeometry args={[0.12, 0.82, 8, 16]} />;
  if (code.startsWith("FASCIA")) return <boxGeometry args={[0.72, 0.75, 0.035]} />;
  if (code.startsWith("LIGAMENT")) return <capsuleGeometry args={[0.035, 0.22, 6, 10]} />;
  return <capsuleGeometry args={[0.045, 0.46, 6, 10]} />;
}

function BodyGuide() { return <group>
  <mesh position={[0, 1.35, 0]}><capsuleGeometry args={[0.46, 1.35, 8, 20]} /><meshStandardMaterial color="#1e3341" transparent opacity={0.24} depthWrite={false} /></mesh>
  <mesh position={[-0.68, 1.25, 0]} rotation={[0, 0, -0.08]}><capsuleGeometry args={[0.11, 1.35, 6, 12]} /><meshStandardMaterial color="#1e3341" transparent opacity={0.2} /></mesh>
  <mesh position={[0.68, 1.25, 0]} rotation={[0, 0, 0.08]}><capsuleGeometry args={[0.11, 1.35, 6, 12]} /><meshStandardMaterial color="#1e3341" transparent opacity={0.2} /></mesh>
  <mesh position={[-0.28, -1.72, 0]}><capsuleGeometry args={[0.12, 0.68, 6, 12]} /><meshStandardMaterial color="#1e3341" transparent opacity={0.2} /></mesh>
  <mesh position={[0.28, -1.72, 0]}><capsuleGeometry args={[0.12, 0.68, 6, 12]} /><meshStandardMaterial color="#1e3341" transparent opacity={0.2} /></mesh>
</group>; }

export function SampleHumanModel({ structures }: { structures: AnatomyStructure[] }) {
  const selected = useViewerStore((state) => state.selectedStructureId); const hovered = useViewerStore((state) => state.hoveredStructureId);
  const visibility = useViewerStore((state) => state.layerVisibility); const sex = useViewerStore((state) => state.sexModel);
  const select = useViewerStore((state) => state.selectStructure); const hover = useViewerStore((state) => state.hoverStructure);
  const isolate = useViewerStore((state) => state.isolateMode); const dimOthers = selected !== null;
  const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();
  return <group scale={sex === "female" ? [0.94, 0.98, 0.94] : [1, 1, 1]}>
    <BodyGuide />
    {structures.map((structure) => {
      if (!visibility[structure.structure_type] || (isolate && selected && selected !== structure.code)) return null;
      const visual = getStructureVisualState({ selected: selected === structure.code, hovered: hovered === structure.code, dimOthers, baseColor: colors[structure.structure_type] });
      return <mesh key={structure.code} name={structure.model_node_name} position={positions[structure.code] ?? [0, 0, 0]}
        onClick={(event) => { stop(event); select(structure.code); }} onPointerOver={(event) => { stop(event); hover(structure.code); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { hover(null); document.body.style.cursor = "default"; }} castShadow receiveShadow>
        <Geometry code={structure.code} /><meshStandardMaterial {...visual} roughness={0.46} metalness={0.04} depthWrite={visual.opacity > 0.3} />
      </mesh>;
    })}
  </group>;
}
