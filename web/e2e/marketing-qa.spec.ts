import { test, expect } from "@playwright/test";

const ROUTES = ["/welcome/","/pricing/","/features/","/faq/","/register/","/contact/","/terms/","/privacy/","/refund-policy/"];

test("marketing no horizontal overflow mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const r of ROUTES) {
    await page.goto(r, { timeout: 30000 });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`overflow ${r}: ${overflow}`);
    expect(overflow).toBe(false);
  }
});

test("marketing no horizontal overflow desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const r of ROUTES) {
    await page.goto(r, { timeout: 30000 });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`overflow ${r}: ${overflow}`);
    expect(overflow).toBe(false);
  }
});
