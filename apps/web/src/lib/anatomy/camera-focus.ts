export type StructureFocusInput = { body_region: string; side: string } | null;
export type StructureFocus = { target: [number, number, number]; distance: number };

const regionView: Record<string, { y: number; distance: number }> = {
  head: { y: 1.42, distance: 3.35 },
  thorax: { y: 0.72, distance: 3.65 },
  trunk: { y: 0.45, distance: 3.8 },
  pelvis: { y: -0.22, distance: 3.7 },
  lower_limb: { y: -1.05, distance: 4.15 },
  knee: { y: -1.2, distance: 3.45 },
};

export function getStructureFocus(structure: StructureFocusInput): StructureFocus {
  if (!structure) return { target: [0, 0.35, 0], distance: 5.8 };
  const region = regionView[structure.body_region] ?? { y: 0.35, distance: 4.2 };
  const x = structure.side === "left" ? -0.34 : structure.side === "right" ? 0.34 : 0;
  return { target: [x, region.y, 0], distance: region.distance };
}
