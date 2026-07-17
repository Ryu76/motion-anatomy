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
