"use client";

import Link from "next/link";
import type { AnatomyStructure } from "@/types/anatomy";
import { contentCatalog, kindMeta } from "@/lib/content-catalog";

const typeLabels = { bone: "골격", muscle: "근육", tendon: "힘줄", ligament: "인대", fascia: "근막", vessel: "혈관" } as const;
const sideLabels = { left: "왼쪽", right: "오른쪽", midline: "정중" } as const;
const regionLabels: Record<string, string> = { head: "머리", neck: "목", thorax: "흉부", abdomen: "복부", back: "등", upper_limb: "상지", pelvis: "골반", lower_limb: "하지", whole_body: "전신" };
const depthLabels: Record<string, string> = { superficial: "표층", intermediate: "중간층", deep: "심층", "source-classified": "출처 기준 분류(상세 깊이 검토 전)", sample: "표층" };
const reviewLabels: Record<AnatomyStructure["review_status"], string> = { draft: "초안", editor_review: "편집 검토", expert_review: "전문가 검토", approved: "승인", deprecated: "사용 중단" };
const unreviewed = "상세 임상 검토가 완료되지 않았습니다. 교육용 참조 정보로만 확인하세요.";

function reviewedValue(value: string | null, structure: AnatomyStructure) {
  if (structure.review_status !== "approved" || !value?.trim()) return unreviewed;
  return value;
}

export function StructureInfoPanel({ structure }: { structure: AnatomyStructure | null }) {
  if (!structure) return <aside className="panel info-panel empty-info" aria-live="polite"><div className="empty-symbol">◎</div><h2>구조를 선택하세요</h2><p>3D 모델 또는 구조 목록을 선택하면 이름, 위치와 교육용 설명이 여기에 표시됩니다.</p></aside>;
  const related = contentCatalog.filter((item) => item.relatedStructureCodes.includes(structure.code));
  const citation = structure.source.citation_text.replace(/^Source object:\s*(.+?);\s*SHA-256:\s*(.+)$/i, "원본 객체: $1; SHA-256 해시: $2");
  return <aside className="panel info-panel" aria-live="polite">
    <div className="info-topline"><span className={`type-badge type-${structure.structure_type}`}>{typeLabels[structure.structure_type]}</span><span>{sideLabels[structure.side]}</span></div>
    <h2>{structure.name_ko}</h2>
    <dl className="reference-names"><div><dt>영문명</dt><dd>{structure.name_en}</dd></div><div><dt>라틴명</dt><dd><i>{structure.name_latin ?? "라틴명 정보 없음"}</i></dd></div></dl>
    <dl className="structure-metadata"><div><dt>신체 부위</dt><dd>{regionLabels[structure.body_region] ?? "출처 기준 분류(상세 검토 전)"}</dd></div><div><dt>깊이</dt><dd>{depthLabels[structure.depth] ?? "출처 기준 분류(상세 검토 전)"}</dd></div><div><dt>검수 상태</dt><dd>{reviewLabels[structure.review_status]}</dd></div></dl>
    <div className="info-section"><h3>설명</h3><p>{reviewedValue(structure.description, structure)}</p></div>
    <div className="info-section"><h3>기능</h3><p>{reviewedValue(structure.function_text, structure)}</p></div>
    {structure.structure_type === "muscle" && <div className="origin-grid"><div><b>기시</b><p>{reviewedValue(structure.origin_text, structure)}</p></div><div><b>정지</b><p>{reviewedValue(structure.insertion_text, structure)}</p></div></div>}
    {related.length > 0 && <div className="info-section related-content"><h3>관련 운동·움직임·스트레칭</h3><div>{related.map((item) => <Link key={`${item.kind}-${item.slug}`} href={`${kindMeta[item.kind].path}/${item.slug}`}><span>{kindMeta[item.kind].label}</span>{item.nameKo}</Link>)}</div></div>}
    <div className="source-card"><b>출처·인용</b>{structure.source.url ? <a href={structure.source.url} target="_blank" rel="noreferrer">{structure.source.title}</a> : <span>{structure.source.title}</span>}<small>{citation}</small></div>
    <p className="medical-note"><b>의학적 안내: </b>{structure.medical_disclaimer}</p>
  </aside>;
}
