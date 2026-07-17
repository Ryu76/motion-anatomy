"use client";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { AnatomyStructure, CameraPreset, ContractionMode, SexModel } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { getMuscleDeformation } from "@/lib/anatomy/muscle-deformation";
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
  const contractionMode = useViewerStore((state) => state.contractionMode); const setContractionMode = useViewerStore((state) => state.setContractionMode);
  const contraction = getMuscleDeformation(contractionMode);
  const sexButton = (model: SexModel, label: string) => <button type="button" aria-label={`${label} 모델`} aria-pressed={sexModel === model} className="segmented-button" onClick={() => setSexModel(model)}>{label}</button>;
  const viewButton = (preset: CameraPreset, label: string) => <button type="button" aria-pressed={cameraPreset === preset} onClick={() => setCameraPreset(preset)}>{label}</button>;
  const contractionButton = (mode: ContractionMode, label: string) => <button type="button" aria-pressed={contractionMode === mode} onClick={() => setContractionMode(mode)}>{label}</button>;
  return <main className="workspace">
    <header className="topbar"><div className="brand"><span className="brand-mark">MA</span><div><b>MOTION ANATOMY</b><span>근육 움직임 아틀라스</span></div></div><nav aria-label="주 메뉴"><a className="active" href="#viewer">해부학</a><span className="nav-disabled" aria-disabled="true">웨이트 · 준비 중</span><span className="nav-disabled" aria-disabled="true">움직임 · 준비 중</span><span className="nav-disabled" aria-disabled="true">스트레칭 · 준비 중</span></nav><div className="prototype-chip">FUNCTIONAL ATLAS · BETA</div></header>
    <section className="hero-copy"><div><span className="eyebrow">FUNCTIONAL MUSCULOSKELETAL LAB</span><h1>근섬유의 방향부터,<br/><em>수축의 변화까지.</em></h1></div><p>근복·근건 접합부·섬유 다발을 분리해 관찰하고 단축성·신장성 수축에서 발생하는 형태 변화를 비교합니다.<br/>기능 해부학 교육과 움직임 분석을 위한 시각화입니다.</p></section>
    <div id="viewer" className="viewer-grid"><AnatomyLayerPanel selectedStructureType={selected?.structure_type} /><section className="viewer-stage">
      <div className="stage-toolbar"><div className="segmented" role="group" aria-label="모델 성별">{sexButton("male", "남성")}{sexButton("female", "여성")}</div><div className="view-buttons" role="group" aria-label="카메라 시점">{viewButton("front", "정면")}{viewButton("back", "후면")}{viewButton("left", "좌측")}{viewButton("right", "우측")}</div><button type="button" className="reset-button" onClick={reset}>초기화</button></div>
      <div className={`contraction-console mode-${contractionMode}`}><div><span className="contraction-kicker">MUSCLE DYNAMICS</span><b>{contraction.label}</b><small>{contraction.description}</small></div><div className="contraction-controls" role="group" aria-label="근수축 시뮬레이션">{contractionButton("rest", "중립")}{contractionButton("concentric", "단축성 수축")}{contractionButton("eccentric", "신장성 수축")}</div><div className="contraction-metrics" aria-hidden="true"><span>근장 <b>{Math.round(contraction.lengthScale * 100)}%</b></span><span>근복 <b>{Math.round(contraction.radiusScale * 100)}%</b></span><span>우상각 <b>{Math.round(contraction.pennationScale * 100)}%</b></span></div></div>
      <AnatomyCanvas structures={structures} />
      <div className="stage-footer"><span>드래그 회전</span><span>휠 확대</span><span>구조 클릭</span><button type="button" aria-pressed={isolate} disabled={!selected} onClick={toggleIsolate}>선택 구조만 보기</button></div>
    </section><StructureInfoPanel structure={selected} /></div>
    <section className="structure-browser" aria-labelledby="structure-browser-title"><div><span className="eyebrow">ACCESSIBLE STRUCTURE LIST</span><h2 id="structure-browser-title">구조 탐색</h2></div><div className="structure-list">{structures.map((structure) => <button type="button" key={structure.code} aria-pressed={selectedId === structure.code} onClick={() => select(structure.code)}><span>{structure.name_ko}</span><small>{structure.name_en}</small></button>)}</div></section>
    <footer><p>수축 변형은 근육의 체적 보존과 일반적인 근섬유 거동을 설명하기 위한 기능 해부학 시뮬레이션입니다. 개인별 병변 평가, 의료 진단 또는 치료 계획을 대체하지 않습니다.</p><span>Motion Anatomy · 3D anatomy adapted from <a href="https://www.z-anatomy.com/" target="_blank" rel="noreferrer">Z-Anatomy / BodyParts3D</a> (CC BY-SA)</span></footer>
  </main>;
}
