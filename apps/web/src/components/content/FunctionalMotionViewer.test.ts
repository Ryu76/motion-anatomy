import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const viewerSource = readFileSync(resolve(process.cwd(), "src/components/content/FunctionalMotionViewer.tsx"), "utf8");

describe("FunctionalMotionViewer morph-only rendering contract", () => {
  it("never installs a pose vertex shader and delegates shape changes to original morph targets only", () => {
    expect(viewerSource).not.toContain("poseShader");
    expect(viewerSource).not.toContain("onBeforeCompile");
    expect(viewerSource).not.toContain("customProgramCacheKey");
    expect(viewerSource).not.toContain("motionShader");
    expect(viewerSource).not.toContain("uMotionProgress");
    expect(viewerSource).not.toContain("uMotionKind");
    expect(viewerSource).toContain("getMorphWeights");
    expect(viewerSource).toContain('setMorph(node, "Shorten", weights.shorten)');
    expect(viewerSource).toContain('setMorph(node, "Lengthen", weights.lengthen)');
  });

  it("accurately discloses the neutral, unrigged source asset and relative-activation scope", () => {
    expect(viewerSource).toContain("검증된 관절 리그가 없어");
    expect(viewerSource).toContain("중립 해부 모델의 기하 형태는 변하지 않습니다");
    expect(viewerSource).toContain("원본 morph 표적 메시만 형태가 변합니다");
    expect(viewerSource).toContain("교육용 상대 활성 표시이며 EMG 측정값이 아닙니다");
  });
});
