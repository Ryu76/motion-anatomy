import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useViewerStore } from "@/stores/viewer-store";
import { AnatomyWorkspace } from "./AnatomyWorkspace";

beforeEach(() => useViewerStore.getState().reset());

vi.mock("./AnatomyCanvas", () => ({ AnatomyCanvas: () => <div data-testid="anatomy-canvas">3D viewer</div> }));

const structures = [
  {
    code: "MUSCLE_GLUTEUS_MAXIMUS_L", name_ko: "왼쪽 대둔근", name_en: "Left gluteus maximus",
    name_latin: "Left gluteus maximus", structure_type: "muscle", body_region: "pelvis", side: "left",
    depth: "sample", description: "고관절 신전", origin_text: "검수 전", insertion_text: "검수 전",
    function_text: "고관절 신전", model_node_name: "sample_gluteus_maximus_l", review_status: "draft",
    medical_disclaimer: "교육용 정보이며 의료 진단을 대체하지 않습니다.", source: { title: "sample", organization: "Motion Anatomy", publication_year: 2026, url: "", license: "Project sample data", citation_text: "sample" }
  },
  {
    code: "BONE_FEMUR_L", name_ko: "왼쪽 대퇴골", name_en: "Left femur", name_latin: "Femur",
    structure_type: "bone", body_region: "lower_limb", side: "left", depth: "sample", description: "허벅지뼈",
    origin_text: "해당 없음", insertion_text: "해당 없음", function_text: "체중 지지", model_node_name: "sample_femur_l",
    review_status: "draft", medical_disclaimer: "교육용 정보이며 의료 진단을 대체하지 않습니다.",
    source: { title: "sample", organization: "Motion Anatomy", publication_year: 2026, url: "", license: "Project sample data", citation_text: "sample" }
  }
] as const;

it("selects a structure from the accessible list and shows bilingual information", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  fireEvent.click(screen.getByRole("button", { name: /왼쪽 대둔근/ }));
  const panel = screen.getByRole("complementary");
  expect(within(panel).getByRole("heading", { name: "왼쪽 대둔근" })).toBeInTheDocument();
  expect(within(panel).getByText("Left gluteus maximus")).toBeInTheDocument();
  expect(within(panel).getByText(/의료 진단을 대체하지 않습니다/)).toBeInTheDocument();
});

it("exposes five layer controls and accessible model and camera state", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  for (const name of ["뼈", "근육", "힘줄", "인대", "근막"]) {
    expect(screen.getByRole("button", { name: new RegExp(name) })).toBeInTheDocument();
  }
  expect(screen.getByRole("group", { name: "모델 성별" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "여성 모델" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("group", { name: "카메라 시점" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "정면" })).toHaveAttribute("aria-pressed", "true");
});

it("clears selected information and isolate when its layer is hidden", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  fireEvent.click(screen.getByRole("button", { name: /왼쪽 대둔근/ }));
  fireEvent.click(screen.getByRole("button", { name: "선택 구조만 보기" }));
  fireEvent.click(screen.getByRole("button", { name: "근육표시" }));

  expect(screen.getByRole("heading", { name: "구조를 선택하세요" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "선택 구조만 보기" })).toBeDisabled();
  expect(useViewerStore.getState().isolateMode).toBe(false);
});

it("offers anatomically named contraction controls with visible state", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);

  const controls = screen.getByRole("group", { name: "근수축 시뮬레이션" });
  expect(within(controls).getByRole("button", { name: "중립" })).toHaveAttribute("aria-pressed", "true");
  expect(within(controls).getByRole("button", { name: "단축성 수축" })).toBeInTheDocument();
  expect(within(controls).getByRole("button", { name: "신장성 수축" })).toBeInTheDocument();

  fireEvent.click(within(controls).getByRole("button", { name: "단축성 수축" }));
  expect(useViewerStore.getState().contractionMode).toBe("concentric");
  expect(screen.getByText(/근복이 짧고 굵어지며/)).toBeInTheDocument();
});
