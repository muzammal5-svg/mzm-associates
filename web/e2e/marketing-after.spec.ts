import { test } from "@playwright/test";

const ROUTES = ["/welcome/","/pricing/","/features/","/faq/","/register/","/contact/"];

test("marketing after mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const r of ROUTES) {
    await page.goto(r, { timeout: 30000 });
    await page.waitForTimeout(1000);
    const name = r.replace(/\//g,"").replace("welcome","home");
    await page.screenshot({ path: `e2e/screenshots/marketing/after/mobile/${name || "home"}.png`, fullPage: true });
  }
});

test("marketing after desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const r of ROUTES) {
    await page.goto(r, { timeout: 30000 });
    await page.waitForTimeout(1000);
    const name = r.replace(/\//g,"").replace("welcome","home");
    await page.screenshot({ path: `e2e/screenshots/marketing/after/desktop/${name || "home"}.png`, fullPage: true });
  }
});
