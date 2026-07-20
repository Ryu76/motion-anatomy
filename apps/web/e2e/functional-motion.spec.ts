import { expect, test } from "@playwright/test";

const paths = [
  { path: "/exercises/squat", motion: "squat", progress: "0.25", pose: "0.250", phase: "하강", tissue: "신장성 부하" },
  { path: "/movements/walking", motion: "walking", progress: "0.25", pose: "0.250", phase: "왼쪽 전진", tissue: "유각기 조절" },
  { path: "/stretches/quadriceps-stretch", motion: "quadriceps-stretch", progress: "0.5", pose: "0.500", phase: "유지", tissue: "수동 신장" },
] as const;

for (const scenario of paths) {
  test(`${scenario.motion} runs as one real-mesh timeline`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    test.skip(testInfo.project.name !== "chromium", "desktop journey is covered once; mobile has a dedicated layout check");
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(scenario.path);
    const viewer = page.getByRole("region", { name: "기능 해부학 3D 동작 뷰어" });
    await expect(viewer).toHaveAttribute("data-motion", scenario.motion);
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 60_000 });
    const timeline = viewer.getByRole("slider", { name: "동작 진행률" });
    await timeline.fill(scenario.progress, { force: true });
    await expect(viewer).toHaveAttribute("data-pose-progress", scenario.pose);
    await expect(viewer).toContainText(scenario.phase);
    await expect(viewer).toContainText(scenario.tissue);
    await viewer.getByRole("button", { name: "측면" }).dispatchEvent("click");
    await expect(viewer.getByRole("button", { name: "측면" })).toHaveAttribute("aria-pressed", "true");
    await viewer.getByRole("slider", { name: "근막 투명도" }).fill("0.25", { force: true });
    await expect(viewer.getByRole("slider", { name: "근막 투명도" })).toHaveValue("0.25");
    await viewer.getByRole("button", { name: "재생" }).dispatchEvent("click");
    await expect(viewer.getByRole("button", { name: "일시정지" })).toBeVisible();
    await expect.poll(async () => Number(await viewer.getAttribute("data-pose-progress")), { timeout: 15_000 }).toBeGreaterThan(Number(scenario.progress) + 0.001);
    await viewer.screenshot({ path: testInfo.outputPath(`${scenario.motion}.png`) });
    expect(errors).toEqual([]);
  });
}

test("functional viewer has no horizontal overflow on mobile", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  await page.goto("/exercises/squat");
  await expect(page.getByRole("region", { name: "기능 해부학 3D 동작 뷰어" }).locator("canvas")).toBeVisible({ timeout: 60_000 });
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});
