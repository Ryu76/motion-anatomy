import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useViewerStore } from "@/stores/viewer-store";
import { AnatomyWorkspace } from "./AnatomyWorkspace";

beforeEach(() => useViewerStore.getState().reset());

vi.mock("./AnatomyCanvas", () => ({ AnatomyCanvas: () => <div data-testid="anatomy-canvas">3D viewer</div> }));

const structures = [
  {
    code: "MUSCLE_GLUTEUS_MAXIMUS_L", name_ko: "왼쪽 대둔근", name_en: "Left gluteus maximus",
    name_latin: "Left gluteus maximus", search_terms: [], structure_type: "muscle", body_region: "pelvis", side: "left",
    depth: "sample", description: "고관절 신전", origin_text: "검수 전", insertion_text: "검수 전",
    function_text: "고관절 신전", model_node_name: "sample_gluteus_maximus_l", review_status: "draft",
    medical_disclaimer: "교육용 정보이며 의료 진단을 대체하지 않습니다.", source: { title: "sample", organization: "Motion Anatomy", publication_year: 2026, url: "", license: "Project sample data", citation_text: "sample" }
  },
  {
    code: "BONE_FEMUR_L", name_ko: "왼쪽 대퇴골", name_en: "Left femur", name_latin: "Femur", search_terms: [],
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

it("keeps the home anatomy workspace neutral and does not expose global motion playback", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);

  expect(screen.queryByRole("group", { name: "근육 움직임 재생" })).not.toBeInTheDocument();
  expect(screen.queryByRole("slider", { name: "근육 움직임 진행률" })).not.toBeInTheDocument();
  expect(screen.queryByText("LIVE MUSCLE MOTION")).not.toBeInTheDocument();
  expect(useViewerStore.getState().motionPlaying).toBe(false);
});

it("renders Korean explanation labels and Korean values while retaining reference names only under labelled fields", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  fireEvent.click(screen.getByRole("button", { name: /왼쪽 대둔근/ }));
  const panel = screen.getByRole("complementary");
  for (const label of ["신체 부위", "깊이", "검수 상태", "설명", "기능", "기시", "정지", "의학적 안내", "출처·인용", "영문명", "라틴명"]) {
    expect(within(panel).getByText(label, { exact: false })).toBeInTheDocument();
  }
  expect(within(panel).getByText("골반")).toBeInTheDocument();
  expect(within(panel).getByText("표층")).toBeInTheDocument();
  expect(within(panel).getByText("초안")).toBeInTheDocument();
  expect(within(panel).getAllByText(/상세 임상 검토가 완료되지 않았습니다/).length).toBeGreaterThan(0);
  expect(within(panel).queryByText("pelvis")).not.toBeInTheDocument();
});

it("links every primary navigation item to a real library", () => {
  render(<AnatomyWorkspace structures={[...structures]} />);
  expect(screen.getByRole("link", { name: "웨이트" })).toHaveAttribute("href", "/exercises");
  expect(screen.getByRole("link", { name: "움직임" })).toHaveAttribute("href", "/movements");
  expect(screen.getByRole("link", { name: "스트레칭" })).toHaveAttribute("href", "/stretches");
});

const makeIliopsoasComponent = (code: string, name_ko: string, name_en: string, name_latin: string, side: "left" | "right") => ({
  code, name_ko, name_en, name_latin, search_terms: ["장요근"], structure_type: "muscle" as const,
  body_region: "abdomen", side, depth: "deep", description: "깊은 장요근 구성 요소",
  origin_text: null, insertion_text: null, function_text: "고관절 굴곡", model_node_name: code,
  review_status: "draft" as const, medical_disclaimer: "교육용 정보이며 의료 진단을 대체하지 않습니다.",
  source: { title: "Z-Anatomy MuscularSystem100", organization: "Z-Anatomy", publication_year: 2026, url: "", license: "CC BY-SA", citation_text: "source" },
});

it("finds exactly the four mesh-backed iliopsoas components, URL-serializes selection, and isolates it", () => {
  const iliopsoasComponents = [
    makeIliopsoasComponent("MUSCLE_PSOAS_MAJOR_L", "왼쪽 큰허리근", "Psoas major", "Musculus psoas major", "left"),
    makeIliopsoasComponent("MUSCLE_PSOAS_MAJOR_R", "오른쪽 큰허리근", "Psoas major", "Musculus psoas major", "right"),
    makeIliopsoasComponent("MUSCLE_ILIACUS_MUSCLE_L", "왼쪽 엉덩근", "Iliacus", "Musculus iliacus", "left"),
    makeIliopsoasComponent("MUSCLE_ILIACUS_MUSCLE_R", "오른쪽 엉덩근", "Iliacus", "Musculus iliacus", "right"),
  ];
  window.history.replaceState(null, "", "/");
  render(<AnatomyWorkspace structures={[...structures, ...iliopsoasComponents]} />);

  fireEvent.change(screen.getByRole("searchbox", { name: "해부 구조 검색" }), { target: { value: "장요근" } });
  expect(screen.getByText("4개 구조")).toBeInTheDocument();
  const results = document.querySelector<HTMLElement>(".structure-list");
  expect(results).not.toBeNull();
  expect(within(results!).getAllByRole("button").map((button) => button.textContent)).toEqual([
    "왼쪽 큰허리근영문명 · Psoas major", "오른쪽 큰허리근영문명 · Psoas major", "왼쪽 엉덩근영문명 · Iliacus", "오른쪽 엉덩근영문명 · Iliacus",
  ]);
  expect(iliopsoasComponents.map((item) => item.name_ko)).not.toContain("장요근");

  fireEvent.click(within(results!).getByRole("button", { name: /왼쪽 큰허리근/ }));
  expect(useViewerStore.getState().selectedStructureId).toBe("MUSCLE_PSOAS_MAJOR_L");
  expect(window.location.search).toContain("structure=MUSCLE_PSOAS_MAJOR_L");
  const isolateButton = screen.getByRole("button", { name: "선택 구조만 보기" });
  expect(isolateButton).toBeEnabled();
  fireEvent.click(isolateButton);
  expect(useViewerStore.getState().isolateMode).toBe(true);
});
