import { test } from "@playwright/test";

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

const SHOTS = [
  { path: "/", name: "home" },
  { path: "/cause-list/", name: "cause-list" },
  { path: "/cases/running/", name: "running-cases" },
  { path: "/clients/", name: "clients" },
  { path: "/clients/new/", name: "add-client" },
  { path: "/cases/new/", name: "new-case" },
  { path: "/reminders/", name: "reminders" },
  { path: "/notifications/", name: "notifications" },
  { path: "/documents/", name: "documents" },
  { path: "/profile/", name: "profile" },
  { path: "/settings/", name: "settings" },
  { path: "/auth/sign-in/", name: "sign-in" },
];

test("ui-before mobile EN", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const s of SHOTS) {
    try {
      await page.goto(s.path, { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `e2e/screenshots/ui-before/${s.name}.png`, fullPage: true });
    } catch (e) {
      console.log("FAIL", s.name, e.message);
    }
  }
  // case view
  try {
    await page.goto("/cases/running/", { timeout: 30000 });
    await page.waitForTimeout(1500);
    const link = page.locator('a[href*="/cases/view"]').first();
    if (await link.count()) { await link.click(); await page.waitForTimeout(2000); }
    await page.screenshot({ path: "e2e/screenshots/ui-before/case-view.png", fullPage: true });
  } catch (e) { console.log("case-view fail", e.message); }
  // client profile
  try {
    await page.goto("/clients/", { timeout: 30000 });
    await page.waitForTimeout(1500);
    const link = page.locator('a[href*="/clients/view"]').first();
    if (await link.count()) { await link.click(); await page.waitForTimeout(2000); }
    await page.screenshot({ path: "e2e/screenshots/ui-before/client-profile.png", fullPage: true });
  } catch (e) { console.log("client-profile fail", e.message); }
  // splash
  try {
    await page.goto("/splash/", { timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "e2e/screenshots/ui-before/splash.png", fullPage: true });
  } catch (e) { console.log("splash fail", e.message); }
});
