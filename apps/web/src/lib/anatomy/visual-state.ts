type VisualInput = { selected: boolean; hovered: boolean; dimOthers: boolean; baseColor?: string };
export type StructureVisualState = { color: string; emissive: string; emissiveIntensity: number; opacity: number; transparent: boolean };

export function getStructureVisualState({ selected, hovered, dimOthers, baseColor = "#7893a6" }: VisualInput): StructureVisualState {
  if (selected) return { color: "#ff5c7a", emissive: "#7d1935", emissiveIntensity: 0.9, opacity: 1, transparent: false };
  if (hovered) return { color: "#ffc857", emissive: "#6f4a00", emissiveIntensity: 0.55, opacity: 1, transparent: false };
  if (dimOthers) return { color: baseColor, emissive: "#000000", emissiveIntensity: 0, opacity: 0.18, transparent: true };
  return { color: baseColor, emissive: "#000000", emissiveIntensity: 0, opacity: 0.92, transparent: true };
}
