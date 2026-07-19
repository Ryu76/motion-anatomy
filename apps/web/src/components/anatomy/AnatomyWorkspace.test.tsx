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
  expect(within(panel).getAllByText("Left gluteus maximus").length).toBeGreaterThanOrEqual(1);
  expect(within(panel).getByText(/의료 진단을 대체하지 않습니다/)).toBeInTheDocument();
  expect(within(panel).getByRole("link", { name: /힙 쓰러스트/ })).toHaveAttribute("href", "/exercises/hip-thrust");
  expect(within(panel).getByRole("link", { name: /걷기/ })).toHaveAttribute("href", "/movements/walking");
  expect(within(panel).getByRole("link", { name: /둔근 스트레칭/ })).toHaveAttribute("href", "/stretches/glute-stretch");
});

it("exposes six detailed anatomy layers with opacity controls", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  for (const name of ["골격", "근육", "힘줄", "인대", "근막", "혈관"]) {
    expect(screen.getByRole("button", { name: new RegExp(name) })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: `${name} 투명도` })).toBeInTheDocument();
  }
  expect(screen.queryByRole("group", { name: "모델 성별" })).not.toBeInTheDocument();
  expect(screen.getByText("Z-Anatomy 기준 모델")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "전체 화면" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "카메라 시점" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "정면" })).toHaveAttribute("aria-pressed", "true");
});

it("clears selected information and isolate when its layer is hidden", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  fireEvent.click(screen.getByRole("button", { name: /왼쪽 대둔근/ }));
  fireEvent.click(screen.getByRole("button", { name: "선택 구조만 보기" }));
  fireEvent.click(screen.getByRole("button", { name: "근육표시" }));

  expect(screen.getByRole("heading", { name: "구조를 선택하세요" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "선택 계통만 보기" })).toBeDisabled();
  expect(useViewerStore.getState().isolateMode).toBe(false);
});

it("plays muscle shortening and lengthening on one continuous timeline", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);

  const controls = screen.getByRole("group", { name: "근육 움직임 재생" });
  expect(within(controls).getByRole("button", { name: "일시정지" })).toBeInTheDocument();
  expect(within(controls).getByRole("slider", { name: "근육 움직임 진행률" })).toBeInTheDocument();
  expect(within(controls).queryByRole("button", { name: "단축성 수축" })).not.toBeInTheDocument();

  fireEvent.click(within(controls).getByRole("button", { name: "일시정지" }));
  expect(useViewerStore.getState().motionPlaying).toBe(false);
});

it("links every primary navigation item to a real library", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  expect(screen.getByRole("link", { name: "웨이트" })).toHaveAttribute("href", "/exercises");
  expect(screen.getByRole("link", { name: "움직임" })).toHaveAttribute("href", "/movements");
  expect(screen.getByRole("link", { name: "스트레칭" })).toHaveAttribute("href", "/stretches");
});

it("searches structures and combines type and side filters", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  const search = screen.getByRole("searchbox", { name: "해부 구조 검색" });
  fireEvent.change(search, { target: { value: "femur" } });
  expect(screen.getByRole("button", { name: /왼쪽 대퇴골/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /왼쪽 대둔근/ })).not.toBeInTheDocument();

  fireEvent.change(search, { target: { value: "" } });
  fireEvent.change(screen.getByRole("combobox", { name: "구조 유형" }), { target: { value: "muscle" } });
  fireEvent.change(screen.getByRole("combobox", { name: "구조 측면" }), { target: { value: "left" } });
  expect(screen.getByRole("button", { name: /왼쪽 대둔근/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /왼쪽 대퇴골/ })).not.toBeInTheDocument();
  expect(screen.getByText("1개 구조")).toBeInTheDocument();
});
