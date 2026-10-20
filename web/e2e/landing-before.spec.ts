import { test } from "@playwright/test";

test("landing before mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const t0 = Date.now();
  await page.goto("/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const url = page.url();
  const text = await page.evaluate(() => document.body.innerText.slice(0, 200));
  const elapsed = Date.now() - t0;
  console.log("MOBILE / -> url:", url, "elapsed:", elapsed, "ms");
  console.log("MOBILE body:", text);
  await page.screenshot({ path: "e2e/screenshots/landing/before/mobile-home.png", fullPage: true });
});

test("landing before desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const t0 = Date.now();
  await page.goto("/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const url = page.url();
  const text = await page.evaluate(() => document.body.innerText.slice(0, 200));
  const elapsed = Date.now() - t0;
  console.log("DESKTOP / -> url:", url, "elapsed:", elapsed, "ms");
  console.log("DESKTOP body:", text);
  await page.screenshot({ path: "e2e/screenshots/landing/before/desktop-home.png", fullPage: true });
});