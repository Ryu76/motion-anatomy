import Link from "next/link";
import type { ContentKind } from "@/lib/content-catalog";

export function SiteHeader({ active = "anatomy" }: { active?: ContentKind | "anatomy" }) {
  const links = [
    { key: "anatomy", href: "/", label: "해부학" },
    { key: "exercise", href: "/exercises", label: "웨이트" },
    { key: "movement", href: "/movements", label: "움직임" },
    { key: "stretch", href: "/stretches", label: "스트레칭" },
  ] as const;
  return <header className="topbar">
    <Link href="/" className="brand" aria-label="Motion Anatomy 홈">
      <span className="brand-mark">MA</span><span><b>MOTION ANATOMY</b><small>근육 움직임 아틀라스</small></span>
    </Link>
    <nav aria-label="주 메뉴">{links.map((link) => <Link key={link.key} className={active === link.key ? "active" : ""} href={link.href}>{link.label}</Link>)}</nav>
    <div className="prototype-chip">FUNCTIONAL ATLAS · BETA</div>
  </header>;
}
