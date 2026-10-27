import type { FunctionalContent } from "@/lib/content-catalog";

export type FunctionalMotionProfile = "squat" | "hip-thrust" | "reverse-lunge" | "walking" | "stair-ascent" | "sit-to-stand" | "glute-stretch" | "quadriceps-stretch" | "calf-stretch";
export type TissueMode = "rest" | "eccentric" | "concentric" | "passive-stretch" | "passive-tension" | "release";
export type TissueState = { mode: TissueMode; label: string; morph: number };
export type FunctionalTargetState = TissueState & { code: string; nameKo: string };
export type FunctionalMotionFrame = {
  phaseLabel: string;
  activation: number;
  tissues: { gluteus: TissueState; rectusFemoris: TissueState; fascia: TissueState };
};

type MotionInput = FunctionalMotionProfile | Pick<FunctionalContent, "motionProfile">;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const tissue = (mode: TissueMode, label: string, morph = 0): TissueState => ({ mode, label, morph });
const profileOf = (motion: MotionInput) => typeof motion === "string" ? motion : motion.motionProfile;
const koreanMuscleNames: Record<string, string> = {
  MUSCLE_GLUTEUS_MAXIMUS_L: "왼쪽 대둔근", MUSCLE_GLUTEUS_MAXIMUS_R: "오른쪽 대둔근",
  MUSCLE_RECTUS_FEMORIS_L: "왼쪽 대퇴직근", MUSCLE_RECTUS_FEMORIS_R: "오른쪽 대퇴직근",
  MUSCLE_LATERAL_HEAD_OF_GASTROCNEMIUS_L: "왼쪽 비복근 가쪽갈래", MUSCLE_LATERAL_HEAD_OF_GASTROCNEMIUS_R: "오른쪽 비복근 가쪽갈래",
  MUSCLE_MEDIAL_HEAD_OF_GASTROCNEMIUS_L: "왼쪽 비복근 안쪽갈래", MUSCLE_MEDIAL_HEAD_OF_GASTROCNEMIUS_R: "오른쪽 비복근 안쪽갈래",
  MUSCLE_SOLEUS_MUSCLE_L: "왼쪽 가자미근", MUSCLE_SOLEUS_MUSCLE_R: "오른쪽 가자미근",
};

export function advanceMotionProgress(progress: number, elapsedMilliseconds: number, playing: boolean) {
  if (!playing) return clamp(progress);
  return (clamp(progress) + Math.max(0, elapsedMilliseconds) / 6000) % 1;
}

/** Original GLB shape keys are the only permitted geometry animation path. */
export function getMorphWeights(targetNames: readonly string[], state: Pick<TissueState, "mode" | "morph">) {
  if (!targetNames.includes("Shorten") || !targetNames.includes("Lengthen")) return { shorten: 0, lengthen: 0 };
  const morph = clamp(state.morph);
  return {
    shorten: state.mode === "concentric" ? morph : 0,
    lengthen: state.mode === "eccentric" || state.mode === "passive-stretch" || state.mode === "passive-tension" ? morph : 0,
  };
}

/**
 * Describes the replay's educational muscle-state timeline. It does not
 * describe a rendered joint pose: the source asset has no verified joint rig.
 */
export function getFunctionalMotionFrame(motion: MotionInput, progress: number): FunctionalMotionFrame {
  const profile = profileOf(motion);
  const p = clamp(progress);
  const isStretch = profile === "glute-stretch" || profile === "quadriceps-stretch" || profile === "calf-stretch";

  if (profile === "walking") {
    const wave = Math.sin(p * Math.PI * 2);
    const activation = Math.abs(wave);
    return {
      phaseLabel: wave >= 0 ? "왼쪽 전진 · 오른쪽 지지" : "오른쪽 전진 · 왼쪽 지지",
      activation,
      tissues: {
        gluteus: tissue(wave < 0 ? "concentric" : "eccentric", wave < 0 ? "단축성 수축" : "신장성 수축", activation),
        rectusFemoris: tissue(wave > 0 ? "concentric" : "eccentric", wave > 0 ? "단축성 수축" : "신장성 수축", activation),
        fascia: tissue(activation > 0.1 ? "passive-tension" : "release", activation > 0.1 ? "수동 장력" : "이완", activation),
      },
    };
  }

  const activation = isStretch ? Math.sin(p * Math.PI) : 1 - Math.abs(2 * p - 1);
  if (isStretch) {
    const targetMode = activation > 0.08 ? "passive-stretch" : "rest";
    const targetLabel = activation > 0.08 ? "수동 신장" : "중립";
    return {
      phaseLabel: activation > 0.98 ? "유지" : p < 0.5 ? "신장 진입" : "이완",
      activation,
      tissues: {
        gluteus: tissue(profile === "glute-stretch" ? targetMode : "rest", profile === "glute-stretch" ? targetLabel : "중립", activation),
        rectusFemoris: tissue(profile === "quadriceps-stretch" ? targetMode : "rest", profile === "quadriceps-stretch" ? targetLabel : "중립", activation),
        fascia: tissue(activation > 0.08 ? "passive-stretch" : "release", activation > 0.08 ? "수동 신장·장력" : "이완", activation),
      },
    };
  }

  const descending = p > 0 && p < 0.5;
  const ascending = p > 0.5 && p < 1;
  const mode = descending ? "eccentric" : ascending ? "concentric" : "rest";
  return {
    phaseLabel: p === 0 || p === 1 ? "중립" : p === 0.5 ? "전환 지점" : descending ? (profile === "squat" ? "하강" : "부하 수용") : (profile === "squat" ? "상승" : "밀어 올리기"),
    activation,
    tissues: {
      gluteus: tissue(mode, descending ? "신장성 수축" : ascending ? "단축성 수축" : "중립", activation),
      rectusFemoris: tissue(mode, descending ? "신장성 수축" : ascending ? "단축성 수축" : "중립", activation),
      fascia: tissue(activation > 0.12 ? "passive-tension" : "release", activation > 0.12 ? "수동 장력" : "이완", activation),
    },
  };
}

export function getFunctionalTargetStates(item: FunctionalContent, progress: number): FunctionalTargetState[] {
  const frame = getFunctionalMotionFrame(item, progress);
  return item.relatedStructureCodes.filter((code) => code.startsWith("MUSCLE_")).map((code) => {
    const state = code.includes("GLUTEUS")
      ? frame.tissues.gluteus
      : code.includes("RECTUS_FEMORIS")
        ? frame.tissues.rectusFemoris
        : item.kind === "stretch"
          ? tissue(frame.activation > 0.08 ? "passive-stretch" : "rest", frame.activation > 0.08 ? "수동 신장" : "중립", frame.activation)
          : tissue(frame.tissues.rectusFemoris.mode, frame.tissues.rectusFemoris.label, frame.activation);
    return { ...state, code, nameKo: koreanMuscleNames[code] ?? "출처 기반 근육 구조(상세 명칭 검토 전)" };
  });
}
