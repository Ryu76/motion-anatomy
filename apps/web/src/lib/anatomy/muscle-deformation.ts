import type { ContractionMode } from "@/types/anatomy";

export type MuscleDeformation = {
  lengthScale: number;
  radiusScale: number;
  pennationScale: number;
  fiberTension: number;
  color: string;
  label: string;
  description: string;
};

const deformation: Record<ContractionMode, MuscleDeformation> = {
  rest: {
    lengthScale: 1,
    radiusScale: 1,
    pennationScale: 1,
    fiberTension: 0.35,
    color: "#c83f52",
    label: "중립",
    description: "기준 근장과 근복 형태를 표시합니다.",
  },
  concentric: {
    lengthScale: 0.82,
    radiusScale: 1.11,
    pennationScale: 1.28,
    fiberTension: 0.9,
    color: "#f05252",
    label: "단축성 수축",
    description: "근복이 짧고 굵어지며 근섬유 우상각이 커지는 과정을 표시합니다.",
  },
  eccentric: {
    lengthScale: 1.18,
    radiusScale: 0.92,
    pennationScale: 0.82,
    fiberTension: 0.72,
    color: "#d65d72",
    label: "신장성 수축",
    description: "외부 부하를 제어하며 근건 단위가 길어지고 근복이 가늘어지는 과정을 표시합니다.",
  },
};

export function getMuscleDeformation(mode: ContractionMode): MuscleDeformation {
  return deformation[mode];
}

export type MotionFrame = {
  phase: ContractionMode;
  phaseLabel: string;
  deformation: MuscleDeformation;
};

const numericKeys: Array<keyof Pick<MuscleDeformation, "lengthScale" | "radiusScale" | "pennationScale" | "fiberTension">> = [
  "lengthScale", "radiusScale", "pennationScale", "fiberTension",
];

function interpolate(from: MuscleDeformation, to: MuscleDeformation, amount: number): MuscleDeformation {
  const result = { ...to };
  for (const key of numericKeys) result[key] = from[key] + (to[key] - from[key]) * amount;
  return result;
}

export function getMotionFrame(progress: number): MotionFrame {
  const value = Math.min(1, Math.max(0, progress));
  const keys: Array<{ at: number; mode: ContractionMode }> = [
    { at: 0, mode: "rest" },
    { at: 0.25, mode: "concentric" },
    { at: 0.5, mode: "rest" },
    { at: 0.75, mode: "eccentric" },
    { at: 1, mode: "rest" },
  ];
  const exact = keys.find((key) => Math.abs(key.at - value) < 1e-9);
  const segmentIndex = Math.min(keys.length - 2, Math.floor(value * 4));
  const from = keys[segmentIndex];
  const to = keys[segmentIndex + 1];
  const amount = (value - from.at) / (to.at - from.at);
  const phase = exact?.mode ?? (value < 0.5 ? "concentric" : "eccentric");
  return {
    phase,
    phaseLabel: deformation[phase].label,
    deformation: interpolate(deformation[from.mode], deformation[to.mode], amount),
  };
}
