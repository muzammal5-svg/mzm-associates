import { test } from "@playwright/test";

async function login(page: any) {
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', "owner-active@demo.test");
  await page.fill('input[type="password"]', "Owner1234!");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

test("marketing screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await login(page);
  await page.goto("/cause-list/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/marketing/raw/cause-list.png", fullPage: false });
  await page.goto("/reminders/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/marketing/raw/reminders.png", fullPage: false });
  await page.goto("/clients/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/marketing/raw/clients.png", fullPage: false });
  // case view: click first case
  await page.goto("/cases/running/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const link = page.locator('a[href*="/cases/view"]').first();
  if (await link.count()) { await link.click(); await page.waitForTimeout(2000); }
  await page.screenshot({ path: "e2e/screenshots/marketing/raw/case-view.png", fullPage: false });
});
