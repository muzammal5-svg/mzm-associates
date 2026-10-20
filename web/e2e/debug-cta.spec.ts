import { test } from "@playwright/test";

test("plan cta selector", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pricing/", { timeout: 30000 });
  await page.waitForTimeout(3000);
  const c1 = await page.locator('a[href*="register?plan="]').count();
  const c2 = await page.locator('a[href*="/register/?plan="]').count();
  console.log("c1:", c1, "c2:", c2);
});