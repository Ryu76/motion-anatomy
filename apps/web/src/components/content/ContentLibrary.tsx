"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { contentCatalog, filterContent, kindMeta, type ContentKind, type Difficulty } from "@/lib/content-catalog";
import { SiteHeader } from "@/components/SiteHeader";

export function ContentLibrary({ kind }: { kind: ContentKind }) {
  const meta = kindMeta[kind];
  const base = useMemo(() => contentCatalog.filter((item) => item.kind === kind), [kind]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const categories = [...new Set(base.map((item) => item.category))];
  const equipmentOptions = [...new Set(base.flatMap((item) => item.equipment))];
  const filtered = filterContent(base, { query, category, equipment, difficulty });
  const clear = () => { setQuery(""); setCategory(""); setEquipment(""); setDifficulty(""); };

  return <main className="workspace library-page">
    <SiteHeader active={kind} />
    <section className="library-hero"><span className="eyebrow">{meta.eyebrow}</span><h1>{meta.label} 라이브러리</h1><p>{meta.description}</p></section>
    <section className="catalog-toolbar" aria-label={`${meta.label} 검색 및 필터`}>
      <label className="catalog-search"><span>검색</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·근육·관절·장비 검색" aria-label={`${meta.label} 검색`} /></label>
      <label><span>카테고리</span><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="카테고리"><option value="">전체</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>장비</span><select value={equipment} onChange={(event) => setEquipment(event.target.value)} aria-label="장비"><option value="">전체</option>{equipmentOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span>난이도</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty | "")} aria-label="난이도"><option value="">전체</option><option>초급</option><option>중급</option><option>고급</option></select></label>
      <button type="button" onClick={clear}>필터 초기화</button>
    </section>
    <div className="catalog-summary"><b>{filtered.length}</b>개 콘텐츠</div>
    {filtered.length ? <section className="content-grid" aria-label={`${meta.label} 콘텐츠 목록`}>{filtered.map((item) => <article className="content-card" key={item.slug}>
      <div className="content-card-top"><span>{item.category}</span><span>{item.difficulty}</span></div><h2>{item.nameKo}</h2><small>{item.nameEn}</small><p>{item.summary}</p>
      <dl><div><dt>주동근</dt><dd>{item.primaryMuscles.join(" · ")}</dd></div><div><dt>관절</dt><dd>{item.joints.join(" · ")}</dd></div><div><dt>장비</dt><dd>{item.equipment.join(" · ")}</dd></div></dl>
      <Link href={`${meta.path}/${item.slug}`}>상세 해부 분석 보기 <span aria-hidden="true">→</span></Link>
    </article>)}</section> : <section className="catalog-empty"><h2>일치하는 콘텐츠가 없습니다</h2><p>검색어나 필터를 변경해 보세요.</p><button type="button" onClick={clear}>전체 콘텐츠 보기</button></section>}
  </main>;
}
