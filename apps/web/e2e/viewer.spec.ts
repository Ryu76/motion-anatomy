import { expect, test } from "@playwright/test";

test("explores a structure and keeps selection across model changes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Motion Anatomy/);
  await expect(page.getByRole("heading", { name: /움직임을 해부하고/ })).toBeVisible();
  await expect(page.locator(".canvas-shell canvas")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /왼쪽 대둔근 Left gluteus maximus/ }).click();
  const info = page.getByRole("complementary");
  await expect(info.getByRole("heading", { name: "왼쪽 대둔근" })).toBeVisible();
  await expect(info.getByText("Left gluteus maximus")).toBeVisible();

  await page.getByRole("button", { name: "여성 모델" }).click();
  await expect(page.getByRole("button", { name: /왼쪽 대둔근 Left gluteus maximus/ })).toHaveAttribute("aria-pressed", "true");

  const muscleLayer = page.getByRole("button", { name: /근육/ });
  await muscleLayer.click();
  await expect(muscleLayer).toHaveAttribute("aria-pressed", "false");
});

test("does not overflow horizontally on a mobile viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  await expect(page.getByRole("heading", { name: "구조 탐색" })).toBeVisible();
});
