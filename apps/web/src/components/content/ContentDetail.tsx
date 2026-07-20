import Link from "next/link";
import { kindMeta, type FunctionalContent } from "@/lib/content-catalog";
import { SiteHeader } from "@/components/SiteHeader";
import { FunctionalMotionViewer } from "./FunctionalMotionViewer";
import type { FunctionalMotionId } from "@/lib/anatomy/functional-motion";

const motionBySlug: Partial<Record<string, FunctionalMotionId>> = {
  squat: "squat",
  walking: "walking",
  "quadriceps-stretch": "quadriceps-stretch",
};

export function ContentDetail({ item }: { item: FunctionalContent }) {
  const meta = kindMeta[item.kind];
  const motion = motionBySlug[item.slug];
  return <main className="workspace detail-page">
    <SiteHeader active={item.kind} />
    <nav className="breadcrumbs" aria-label="현재 위치"><Link href={meta.path}>{meta.label}</Link><span>/</span><span aria-current="page">{item.nameKo}</span></nav>
    <article className="detail-layout">
      <header className="detail-hero"><span className="eyebrow">{item.category} · {item.difficulty}</span><h1>{item.nameKo}</h1><p className="detail-en">{item.nameEn}</p><p>{item.summary}</p><div className="chip-row">{item.equipment.map((value) => <span key={value}>{value}</span>)}</div></header>
      {motion && <FunctionalMotionViewer motion={motion} />}
      <section className="detail-main"><div className="detail-section"><span className="section-number">01</span><div><h2>시작 자세</h2><p>{item.startPosition}</p></div></div>
        <div className="detail-section"><span className="section-number">02</span><div><h2>수행 순서</h2><ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol></div></div>
        <div className="detail-section"><span className="section-number">03</span><div><h2>호흡</h2><p>{item.breathing}</p></div></div>
        <div className="detail-section caution-section"><span className="section-number">!</span><div><h2>교육용 주의사항</h2><ul>{item.cautions.map((caution) => <li key={caution}>{caution}</li>)}</ul></div></div>
      </section>
      <aside className="detail-anatomy"><span className="eyebrow">FUNCTIONAL ANATOMY</span><h2>해부학 연결</h2><dl><div><dt>주동근</dt><dd>{item.primaryMuscles.join(" · ")}</dd></div><div><dt>협력근</dt><dd>{item.assistingMuscles.join(" · ")}</dd></div><div><dt>관련 관절</dt><dd>{item.joints.join(" · ")}</dd></div></dl>
        <h3>3D 구조에서 확인</h3><div className="anatomy-link-list">{item.relatedStructureCodes.map((code) => <Link key={code} href={`/?structure=${encodeURIComponent(code)}#viewer`}>{code.replaceAll("_", " ")} <span aria-hidden="true">↗</span></Link>)}</div>
      </aside>
    </article>
    <footer className="content-disclaimer">본 콘텐츠는 기능 해부학 교육용이며 개인별 진단·치료·운동 처방을 대체하지 않습니다. 통증이 있으면 의료 또는 운동 전문가와 상담하세요.</footer>
  </main>;
}
