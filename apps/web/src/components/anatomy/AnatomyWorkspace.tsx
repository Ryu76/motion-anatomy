"use client";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { AnatomyStructure, CameraPreset, SexModel } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { AnatomyLayerPanel } from "./AnatomyLayerPanel";
import { StructureInfoPanel } from "./StructureInfoPanel";

const AnatomyCanvas = dynamic(
  () => import("./AnatomyCanvas").then((module) => module.AnatomyCanvas),
  { ssr: false, loading: () => <div className="viewer-fallback" role="status">3D 모델을 준비하고 있습니다…</div> }
);

export function AnatomyWorkspace({ structures }: { structures: AnatomyStructure[] }) {
  const selectedId = useViewerStore((state) => state.selectedStructureId); const selected = useMemo(() => structures.find((item) => item.code === selectedId) ?? null, [selectedId, structures]);
  const sexModel = useViewerStore((state) => state.sexModel); const setSexModel = useViewerStore((state) => state.setSexModel);
  const setCameraPreset = useViewerStore((state) => state.setCameraPreset); const cameraPreset = useViewerStore((state) => state.cameraPreset); const select = useViewerStore((state) => state.selectStructure);
  const isolate = useViewerStore((state) => state.isolateMode); const toggleIsolate = useViewerStore((state) => state.toggleIsolate); const reset = useViewerStore((state) => state.reset);
  const sexButton = (model: SexModel, label: string) => <button type="button" aria-label={`${label} 모델`} aria-pressed={sexModel === model} className="segmented-button" onClick={() => setSexModel(model)}>{label}</button>;
  const viewButton = (preset: CameraPreset, label: string) => <button type="button" aria-pressed={cameraPreset === preset} onClick={() => setCameraPreset(preset)}>{label}</button>;
  return <main className="workspace">
    <header className="topbar"><div className="brand"><span className="brand-mark">MA</span><div><b>MOTION ANATOMY</b><span>근육 움직임 아틀라스</span></div></div><nav aria-label="주 메뉴"><a className="active" href="#viewer">해부학</a><span className="nav-disabled" aria-disabled="true">웨이트 · 준비 중</span><span className="nav-disabled" aria-disabled="true">움직임 · 준비 중</span><span className="nav-disabled" aria-disabled="true">스트레칭 · 준비 중</span></nav><div className="prototype-chip">SPRINT 1 · SAMPLE</div></header>
    <section className="hero-copy"><div><span className="eyebrow">HUMAN MOVEMENT LAB</span><h1>움직임을 해부하고,<br/><em>구조로 이해하세요.</em></h1></div><p>교육용 3D 표본의 구조를 선택해 위치와 기능을 확인합니다.<br/>실제 해부학 모델은 라이선스 검토 후 연결됩니다.</p></section>
    <div id="viewer" className="viewer-grid"><AnatomyLayerPanel selectedStructureType={selected?.structure_type} /><section className="viewer-stage">
      <div className="stage-toolbar"><div className="segmented" role="group" aria-label="모델 성별">{sexButton("male", "남성")}{sexButton("female", "여성")}</div><div className="view-buttons" role="group" aria-label="카메라 시점">{viewButton("front", "정면")}{viewButton("back", "후면")}{viewButton("left", "좌측")}{viewButton("right", "우측")}</div><button type="button" className="reset-button" onClick={reset}>초기화</button></div>
      <AnatomyCanvas structures={structures} />
      <div className="stage-footer"><span>드래그 회전</span><span>휠 확대</span><span>구조 클릭</span><button type="button" aria-pressed={isolate} disabled={!selected} onClick={toggleIsolate}>선택 구조만 보기</button></div>
    </section><StructureInfoPanel structure={selected} /></div>
    <section className="structure-browser" aria-labelledby="structure-browser-title"><div><span className="eyebrow">ACCESSIBLE STRUCTURE LIST</span><h2 id="structure-browser-title">구조 탐색</h2></div><div className="structure-list">{structures.map((structure) => <button type="button" key={structure.code} aria-pressed={selectedId === structure.code} onClick={() => select(structure.code)}><span>{structure.name_ko}</span><small>{structure.name_en}</small></button>)}</div></section>
    <footer><p>표시되는 활성도와 설명은 교육용 상대 표현이며 개인의 자세, 부하, 가동범위에 따라 달라질 수 있습니다. 의료 진단이나 치료를 대체하지 않습니다.</p><span>Motion Anatomy · Educational Prototype</span></footer>
  </main>;
}
