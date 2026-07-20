import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { contentCatalog } from "@/lib/content-catalog";
import { ContentDetail } from "./ContentDetail";

vi.mock("./FunctionalMotionViewer", () => ({
  FunctionalMotionViewer: ({ motion }: { motion: string }) => <section aria-label="기능 해부학 3D 동작 뷰어" data-motion={motion}>motion viewer</section>,
}));

for (const [kind, slug, motion] of [
  ["exercise", "squat", "squat"],
  ["movement", "walking", "walking"],
  ["stretch", "quadriceps-stretch", "quadriceps-stretch"],
] as const) {
  it(`integrates the real motion viewer on ${kind}/${slug}`, () => {
    const item = contentCatalog.find((entry) => entry.kind === kind && entry.slug === slug)!;
    render(<ContentDetail item={item} />);
    const viewer = screen.getByRole("region", { name: "기능 해부학 3D 동작 뷰어" });
    expect(viewer).toHaveAttribute("data-motion", motion);
  });
}

it("does not add the motion viewer to unsupported detail pages", () => {
  render(<ContentDetail item={contentCatalog.find((item) => item.slug === "hip-thrust")!} />);
  expect(screen.queryByRole("region", { name: "기능 해부학 3D 동작 뷰어" })).not.toBeInTheDocument();
});
