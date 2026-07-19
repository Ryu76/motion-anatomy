"use client";
import Link from "next/link";
import type { AnatomyStructure } from "@/types/anatomy";
import { contentCatalog, kindMeta } from "@/lib/content-catalog";

const typeLabels = { bone: "골격", muscle: "근육", tendon: "힘줄", ligament: "인대", fascia: "근막", vessel: "혈관" } as const;
export function StructureInfoPanel({ structure }: { structure: AnatomyStructure | null }) {
  if (!structure) return <aside className="panel info-panel empty-info" aria-live="polite"><div className="empty-symbol">◎</div><h2>구조를 선택하세요</h2><p>3D 모델 또는 구조 목록을 선택하면 이름, 위치와 교육용 설명이 여기에 표시됩니다.</p></aside>;
  const related = contentCatalog.filter((item) => item.relatedStructureCodes.includes(structure.code));
  return <aside className="panel info-panel" aria-live="polite">
    <div className="info-topline"><span className={`type-badge type-${structure.structure_type}`}>{typeLabels[structure.structure_type]}</span><span>{structure.side === "left" ? "LEFT" : structure.side === "right" ? "RIGHT" : "MIDLINE"}</span></div>
    <h2>{structure.name_ko}</h2><p className="english-name">{structure.name_en}</p><p className="latin-name"><i>{structure.name_latin}</i> · {structure.body_region} · {structure.depth}</p>
    <div className="info-section"><h3>위치와 설명</h3><p>{structure.description}</p></div>
    <div className="info-section"><h3>주요 기능</h3><p>{structure.function_text}</p></div>
    {structure.structure_type === "muscle" && <div className="origin-grid"><div><b>기시</b><p>{structure.origin_text}</p></div><div><b>정지</b><p>{structure.insertion_text}</p></div></div>}
    {related.length > 0 && <div className="info-section related-content"><h3>관련 운동·움직임·스트레칭</h3><div>{related.map((item) => <Link key={`${item.kind}-${item.slug}`} href={`${kindMeta[item.kind].path}/${item.slug}`}><span>{kindMeta[item.kind].label}</span>{item.nameKo}</Link>)}</div></div>}
    <div className="source-card"><b>검수 상태 · {structure.review_status}</b>{structure.source.url ? <a href={structure.source.url} target="_blank" rel="noreferrer">{structure.source.title}</a> : <span>{structure.source.title}</span>}</div>
    <p className="medical-note">{structure.medical_disclaimer}</p>
  </aside>;
}
