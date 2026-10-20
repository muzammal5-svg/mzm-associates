import { test, expect } from "@playwright/test";

test("pricing plans load anon", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pricing/", { timeout: 30000 });
  await page.waitForTimeout(3000);
  const text = await page.locator(".card").first().textContent();
  console.log("pricing card text:", text);
  const cta = await page.locator('a[href*="/register?plan="]').count();
  console.log("plan CTA count:", cta);
});