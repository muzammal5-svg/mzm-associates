import { test, expect } from "@playwright/test";

const PUBLIC = ["/welcome/","/pricing/","/register/","/terms/","/privacy/","/refund-policy/","/contact/"];

test("public routes mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const p of PUBLIC) {
    await page.goto(p, { timeout: 30000 });
    await page.waitForTimeout(500);
    console.log("PUBLIC", p, page.url());
  }
});

test("public routes desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const p of PUBLIC) {
    await page.goto(p, { timeout: 30000 });
    await page.waitForTimeout(500);
    console.log("PUBLIC-DESKTOP", p, page.url());
  }
});
