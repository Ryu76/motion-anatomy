import { expect, test } from "@playwright/test";

test("explores a structure and keeps selection across model changes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Motion Anatomy/);
  await expect(page.getByRole("heading", { name: /모든 해부 계통을 보고/ })).toBeVisible();
  const canvas = page.locator(".canvas-shell canvas");
  await expect(canvas).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: /왼쪽 대둔근 Left gluteus maximus/ }).click();
  const info = page.getByRole("complementary");
  await expect(info.getByRole("heading", { name: "왼쪽 대둔근" })).toBeVisible();
  await expect(info.getByText("Left gluteus maximus")).toBeVisible();

  await page.getByRole("button", { name: "여성 모델" }).click();
  await expect(page.getByRole("button", { name: /왼쪽 대둔근 Left gluteus maximus/ })).toHaveAttribute("aria-pressed", "true");

  const muscleLayer = page.getByRole("button", { name: /근육/ });
  await muscleLayer.click();
  await expect(muscleLayer).toHaveAttribute("aria-pressed", "false");
  const layerPanel = page.getByRole("region", { name: "해부학 레이어" });
  await expect(layerPanel.getByRole("button", { name: /^혈관/ })).toBeVisible();
  await layerPanel.getByRole("slider", { name: "혈관 투명도" }).fill("0.65");
  await expect(layerPanel.getByRole("slider", { name: "혈관 투명도" })).toHaveValue("0.65");
});

test("does not overflow horizontally on a mobile viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  await expect(page.getByRole("heading", { name: "구조 탐색" })).toBeVisible();
});

test("plays concentric and eccentric deformation on one continuous timeline", async ({ page }) => {
  await page.goto("/");
  const dynamics = page.getByRole("group", { name: "근육 움직임 재생" });
  await dynamics.getByRole("button", { name: "일시정지" }).click();
  await expect(dynamics.getByRole("button", { name: "재생" })).toBeVisible();
  const timeline = dynamics.getByRole("slider", { name: "근육 움직임 진행률" });
  await timeline.fill("0.25");
  await expect(page.locator(".contraction-metrics")).toContainText("근장 82%");
  await expect(page.locator(".contraction-metrics")).toContainText("근복 111%");
  await timeline.fill("0.75");
  await expect(page.locator(".contraction-metrics")).toContainText("근장 118%");
  await expect(page.locator(".contraction-metrics")).toContainText("근복 92%");
});
