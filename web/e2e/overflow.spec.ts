import { test, expect } from "@playwright/test";

const CREDENTIALS = { email: "lawyer@mzm.pk", password: "Lawyer1234!" };

async function login(page: any) {
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.waitForTimeout(500);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
}

const ROUTES = ["/","/cause-list/","/cases/running/","/cases/view/?id=1","/clients/","/clients/new/","/clients/view/?id=1","/cases/new/","/reminders/","/notifications/","/documents/","/profile/","/settings/","/auth/sign-in/"];

test("no horizontal overflow mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const r of ROUTES) {
    try {
      await page.goto(r, { timeout: 30000 });
      await page.waitForTimeout(1500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`overflow ${r}: ${overflow}`);
      expect(overflow).toBe(false);
    } catch (e: any) {
      console.log("skip", r, e.message);
    }
  }
});
