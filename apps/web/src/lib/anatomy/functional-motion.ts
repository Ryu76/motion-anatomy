export type FunctionalMotionId = "squat" | "walking" | "quadriceps-stretch";
export type TissueMode = "rest" | "eccentric" | "concentric" | "passive-stretch" | "passive-tension" | "release";

type TissueState = { mode: TissueMode; label: string; morph: number };
export type FunctionalMotionFrame = {
  phaseLabel: string;
  poseDepth: number;
  joints: {
    hipFlexion: number; kneeFlexion: number; ankleDorsiflexion: number;
    leftHipFlexion: number; leftKneeFlexion: number;
  };
  tissues: { gluteus: TissueState; rectusFemoris: TissueState; fascia: TissueState };
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const tissue = (mode: TissueMode, label: string, morph = 0): TissueState => ({ mode, label, morph });

export function getFunctionalMotionFrame(motion: FunctionalMotionId, progress: number): FunctionalMotionFrame {
  const p = clamp(progress);
  if (motion === "squat") {
    const depth = 1 - Math.abs(2 * p - 1);
    const descending = p > 0 && p < 0.5;
    const ascending = p > 0.5 && p < 1;
    const mode = descending ? "eccentric" : ascending ? "concentric" : "rest";
    return {
      phaseLabel: p === 0 || p === 1 ? "기립" : p === 0.5 ? "최저점" : descending ? "하강" : "상승",
      poseDepth: depth,
      joints: { hipFlexion: 82 * depth, kneeFlexion: 104 * depth, ankleDorsiflexion: 24 * depth, leftHipFlexion: 82 * depth, leftKneeFlexion: 104 * depth },
      tissues: {
        gluteus: tissue(mode, descending ? "신장성 부하" : ascending ? "단축성 부하" : "전환", depth),
        rectusFemoris: tissue(mode, descending ? "신장성 부하" : ascending ? "단축성 부하" : "전환", depth),
        fascia: tissue(depth > 0.12 ? "passive-tension" : "release", depth > 0.12 ? "수동 장력" : "이완", depth),
      },
    };
  }
  if (motion === "walking") {
    const wave = Math.sin(p * Math.PI * 2);
    const knee = Math.max(0, -wave) * 58;
    return {
      phaseLabel: wave >= 0 ? "왼쪽 전진 · 오른쪽 지지" : "오른쪽 전진 · 왼쪽 지지",
      poseDepth: Math.abs(wave),
      joints: { hipFlexion: 0, kneeFlexion: 0, ankleDorsiflexion: 0, leftHipFlexion: 28 * wave, leftKneeFlexion: knee },
      tissues: {
        gluteus: tissue(wave < 0 ? "concentric" : "eccentric", wave < 0 ? "추진" : "부하 수용", Math.abs(wave)),
        rectusFemoris: tissue(wave > 0 ? "concentric" : "eccentric", wave > 0 ? "유각기 조절" : "지지기 조절", Math.abs(wave)),
        fascia: tissue(Math.abs(wave) > 0.1 ? "passive-tension" : "release", Math.abs(wave) > 0.1 ? "교대 수동 장력" : "이완", Math.abs(wave)),
      },
    };
  }
  const depth = Math.sin(p * Math.PI);
  return {
    phaseLabel: depth > 0.98 ? "유지" : p < 0.5 ? "진입" : "이완",
    poseDepth: depth,
    joints: { hipFlexion: -8 * depth, kneeFlexion: 0, ankleDorsiflexion: 0, leftHipFlexion: -8 * depth, leftKneeFlexion: 128 * depth },
    tissues: {
      gluteus: tissue("rest", "안정", 0),
      rectusFemoris: tissue(depth > 0.08 ? "passive-stretch" : "rest", depth > 0.08 ? "수동 신장" : "중립", depth),
      fascia: tissue(depth > 0.08 ? "passive-stretch" : "release", depth > 0.08 ? "수동 신장·장력" : "이완", depth),
    },
  };
}

function rotateX(point: [number, number, number], pivot: [number, number, number], angle: number): [number, number, number] {
  const radians = angle * Math.PI / 180;
  const y = point[1] - pivot[1]; const z = point[2] - pivot[2];
  return [point[0], pivot[1] + y * Math.cos(radians) - z * Math.sin(radians), pivot[2] + y * Math.sin(radians) + z * Math.cos(radians)];
}

export function deformAnatomyPoint(point: [number, number, number], motion: FunctionalMotionId, progress: number): [number, number, number] {
  const frame = getFunctionalMotionFrame(motion, progress);
  const [x, y] = point;
  if (motion === "squat") {
    const d = frame.poseDepth;
    if (y >= 0.82) return [x, point[1] - 0.26 * d, point[2] + 0.05 * d];
    if (y >= 0.43) return rotateX(point, [x, 0.82, 0], -48 * d);
    return rotateX(rotateX(point, [x, 0.43, 0], 72 * d), [x, 0.82, 0], -48 * d);
  }
  if (motion === "walking") {
    const sideWave = Math.sin(clamp(progress) * Math.PI * 2) * (x >= 0 ? 1 : -1);
    if (y >= 0.82) return [point[0], point[1] + Math.abs(sideWave) * 0.015, point[2]];
    if (y >= 0.43) return rotateX(point, [x, 0.82, 0], 28 * sideWave);
    return rotateX(rotateX(point, [x, 0.43, 0], -42 * Math.max(0, -sideWave)), [x, 0.82, 0], 28 * sideWave);
  }
  if (x < 0 || y >= 0.82) return point;
  if (y >= 0.43) return rotateX(point, [x, 0.82, 0], 8 * frame.poseDepth);
  return rotateX(point, [x, 0.43, 0], -128 * frame.poseDepth);
}
