"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { AnatomyStructure, CameraPreset } from "@/types/anatomy";
import { useViewerStore } from "@/stores/viewer-store";
import { getMotionFrame } from "@/lib/anatomy/muscle-deformation";
import { AnatomyLayerPanel } from "./AnatomyLayerPanel";
import { StructureInfoPanel } from "./StructureInfoPanel";
import { SiteHeader } from "@/components/SiteHeader";
import { isIndividuallySelectable } from "@/lib/anatomy/scene-selection";

const AnatomyCanvas = dynamic(
  () => import("./AnatomyCanvas").then((module) => module.AnatomyCanvas),
  { ssr: false, loading: () => <div className="viewer-fallback" role="status">3D 모델을 준비하고 있습니다…</div> }
);

export function AnatomyWorkspace({ structures }: { structures: AnatomyStructure[] }) {
  const selectedId = useViewerStore((state) => state.selectedStructureId); const selected = useMemo(() => structures.find((item) => item.code === selectedId) ?? null, [selectedId, structures]);
  const setCameraPreset = useViewerStore((state) => state.setCameraPreset); const cameraPreset = useViewerStore((state) => state.cameraPreset); const select = useViewerStore((state) => state.selectStructure);
  const isolate = useViewerStore((state) => state.isolateMode); const toggleIsolate = useViewerStore((state) => state.toggleIsolate); const reset = useViewerStore((state) => state.reset);
  const motionPlaying = useViewerStore((state) => state.motionPlaying); const toggleMotionPlayback = useViewerStore((state) => state.toggleMotionPlayback);
  const motionProgress = useViewerStore((state) => state.motionProgress); const setMotionProgress = useViewerStore((state) => state.setMotionProgress);
  const motionFrame = getMotionFrame(motionProgress); const contraction = motionFrame.deformation;
  const [query, setQuery] = useState(""); const [typeFilter, setTypeFilter] = useState(""); const [regionFilter, setRegionFilter] = useState(""); const [sideFilter, setSideFilter] = useState("");
  const filteredStructures = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko-KR");
    return structures.filter((item) => {
      const matchesQuery = !needle || [item.name_ko, item.name_en, item.name_latin, item.body_region, item.structure_type].join(" ").toLocaleLowerCase("ko-KR").includes(needle);
      return matchesQuery && (!typeFilter || item.structure_type === typeFilter) && (!regionFilter || item.body_region === regionFilter) && (!sideFilter || item.side === sideFilter);
    });
  }, [query, regionFilter, sideFilter, structures, typeFilter]);
  const regions = useMemo(() => [...new Set(structures.map((item) => item.body_region))], [structures]);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("structure");
    if (requested && structures.some((item) => item.code === requested)) select(requested);
  }, [select, structures]);
  const viewButton = (preset: CameraPreset, label: string) => <button type="button" aria-pressed={cameraPreset === preset} onClick={() => setCameraPreset(preset)}>{label}</button>;
  const enterFullscreen = async () => { const viewer = document.getElementById("viewer"); if (viewer?.requestFullscreen) await viewer.requestFullscreen(); };

  return <main className="workspace">
    <SiteHeader active="anatomy" />
    <section className="hero-copy"><div><span className="eyebrow">INTERACTIVE ANATOMY ATLAS</span><h1>모든 해부 계통을 보고,<br/><em>실제 근육의 움직임까지.</em></h1></div><p>골격·근육·힘줄·인대·근막·혈관을 독립적으로 관찰하고 실제 해부학 근육 메시가 수축하고 이완하는 연속 동작을 재생합니다.<br/>기능 해부학 교육과 움직임 분석을 위한 시각화입니다.</p></section>
    <div id="viewer" className="viewer-grid"><AnatomyLayerPanel selectedStructureType={selected?.structure_type} /><section className="viewer-stage">
      <div className="stage-toolbar"><span className="model-source-chip">Z-Anatomy 기준 모델</span><div className="view-buttons" role="group" aria-label="카메라 시점">{viewButton("front", "정면")}{viewButton("back", "후면")}{viewButton("left", "좌측")}{viewButton("right", "우측")}</div><button type="button" className="reset-button" onClick={reset}>초기화</button></div>
      <div className={`contraction-console mode-${motionFrame.phase}`}><div><span className="contraction-kicker">LIVE MUSCLE MOTION</span><b>{motionFrame.phaseLabel}</b><small>실제 근육 메시가 짧고 굵어졌다가 이완·신장되는 한 동작을 연속 재생합니다.</small></div><div className="motion-controls" role="group" aria-label="근육 움직임 재생"><button type="button" onClick={toggleMotionPlayback}>{motionPlaying ? "일시정지" : "재생"}</button><input type="range" min="0" max="1" step="0.001" value={motionProgress} aria-label="근육 움직임 진행률" onChange={(event) => setMotionProgress(Number(event.target.value))}/><output>{Math.round(motionProgress * 100)}%</output></div><div className="contraction-metrics" aria-hidden="true"><span>근장 <b>{Math.round(contraction.lengthScale * 100)}%</b></span><span>근복 <b>{Math.round(contraction.radiusScale * 100)}%</b></span><span>우상각 <b>{Math.round(contraction.pennationScale * 100)}%</b></span></div></div>
      <AnatomyCanvas structures={structures} />
      <div className="stage-footer"><span>드래그 회전</span><span>휠 확대</span><span>구조 클릭</span><button type="button" onClick={enterFullscreen}>전체 화면</button><button type="button" aria-pressed={isolate} disabled={!selected} onClick={toggleIsolate}>{isIndividuallySelectable(selectedId) ? "선택 구조만 보기" : "선택 계통만 보기"}</button></div>
    </section><StructureInfoPanel structure={selected} /></div>
    <section className="structure-browser" aria-labelledby="structure-browser-title"><div className="browser-heading"><div><span className="eyebrow">ACCESSIBLE STRUCTURE LIST</span><h2 id="structure-browser-title">구조 탐색</h2></div><strong>{filteredStructures.length}개 구조</strong></div>
      <div className="structure-filters"><label className="structure-search"><span>검색</span><input type="search" aria-label="해부 구조 검색" placeholder="한글·영문·라틴명 검색" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span>유형</span><select aria-label="구조 유형" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">전체</option><option value="bone">골격</option><option value="muscle">근육</option><option value="tendon">힘줄</option><option value="ligament">인대</option><option value="fascia">근막</option><option value="vessel">혈관</option></select></label><label><span>부위</span><select aria-label="신체 부위" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option value="">전체</option>{regions.map((region) => <option key={region}>{region}</option>)}</select></label><label><span>측면</span><select aria-label="구조 측면" value={sideFilter} onChange={(event) => setSideFilter(event.target.value)}><option value="">전체</option><option value="left">왼쪽</option><option value="right">오른쪽</option><option value="midline">정중</option></select></label><button type="button" onClick={() => { setQuery(""); setTypeFilter(""); setRegionFilter(""); setSideFilter(""); }}>초기화</button></div>
      {filteredStructures.length ? <div className="structure-list">{filteredStructures.map((structure) => <button type="button" key={structure.code} aria-pressed={selectedId === structure.code} onClick={() => select(structure.code)}><span>{structure.name_ko}</span><small>{structure.name_en}</small></button>)}</div> : <div className="structure-empty"><b>일치하는 해부 구조가 없습니다</b><span>검색어나 필터를 변경해 보세요.</span></div>}
    </section>
    <footer><p>수축 변형은 근육의 체적 보존과 일반적인 근섬유 거동을 설명하기 위한 기능 해부학 시뮬레이션입니다. 개인별 병변 평가, 의료 진단 또는 치료 계획을 대체하지 않습니다.</p><span>Motion Anatomy · 3D anatomy adapted from <a href="https://www.z-anatomy.com/" target="_blank" rel="noreferrer">Z-Anatomy / BodyParts3D</a> (CC BY-SA)</span></footer>
  </main>;
}
