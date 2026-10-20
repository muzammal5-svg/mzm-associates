import { test } from "@playwright/test";

test("pricing hrefs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pricing/", { timeout: 30000 });
  await page.waitForTimeout(3000);
  const hrefs = await page.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")).filter((h) => h && h.includes("register")));
  console.log("register links:", JSON.stringify(hrefs));
});