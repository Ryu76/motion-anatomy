import { notFound } from "next/navigation";
import { ContentDetail } from "@/components/content/ContentDetail";
import { contentCatalog, getContentBySlug } from "@/lib/content-catalog";
export function generateStaticParams() { return contentCatalog.filter((item) => item.kind === "stretch").map((item) => ({ slug: item.slug })); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = getContentBySlug("stretch", slug); if (!item) notFound(); return <ContentDetail item={item} />; }
