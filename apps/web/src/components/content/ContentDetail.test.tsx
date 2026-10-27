import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { contentCatalog } from "@/lib/content-catalog";
import { ContentDetail } from "./ContentDetail";

vi.mock("./FunctionalMotionViewer", () => ({
  FunctionalMotionViewer: ({ content }: { content: { slug: string } }) => <section aria-label="기능 해부학 3D 동작 뷰어" data-motion={content.slug}>motion viewer</section>,
}));

for (const item of contentCatalog) {
  it(`integrates the real motion viewer on ${item.kind}/${item.slug}`, () => {
    render(<ContentDetail item={item} />);
    const viewer = screen.getByRole("region", { name: "기능 해부학 3D 동작 뷰어" });
    expect(viewer).toHaveAttribute("data-motion", item.slug);
  });
}
