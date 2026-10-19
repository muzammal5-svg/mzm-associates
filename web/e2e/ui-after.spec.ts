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

const MOBILE_EN = [
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
];

test("ui-after mobile EN", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  for (const s of MOBILE_EN) {
    try {
      await page.goto(s.path, { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `e2e/screenshots/ui-after/${s.name}.png`, fullPage: true });
    } catch (e: any) { console.log("FAIL", s.name, e.message); }
  }
  // case view
  try {
    await page.goto("/cases/running/", { timeout: 30000 });
    await page.waitForTimeout(1500);
    const link = page.locator('a[href*="/cases/view"]').first();
    if (await link.count()) { await link.click(); await page.waitForTimeout(2000); }
    await page.screenshot({ path: "e2e/screenshots/ui-after/case-view.png", fullPage: true });
  } catch (e: any) { console.log("case-view fail", e.message); }
  // client profile
  try {
    await page.goto("/clients/", { timeout: 30000 });
    await page.waitForTimeout(1500);
    const link = page.locator('a[href*="/clients/view"]').first();
    if (await link.count()) { await link.click(); await page.waitForTimeout(2000); }
    await page.screenshot({ path: "e2e/screenshots/ui-after/client-profile.png", fullPage: true });
  } catch (e: any) { console.log("client-profile fail", e.message); }
});

test("ui-after mobile UR", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page);
  await page.evaluate(() => localStorage.setItem("i18nextLng", "ur"));
  await page.reload();
  await page.waitForTimeout(2000);
  for (const name of ["home","cause-list","reminders","profile"]) {
    const path = name === "home" ? "/" : `/${name}/`;
    try {
      await page.goto(path, { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `e2e/screenshots/ui-after/${name}-ur.png`, fullPage: true });
    } catch (e: any) { console.log("FAIL", name, e.message); }
  }
});

test("ui-after desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page);
  for (const s of [{path:"/",name:"home"},{path:"/cause-list/",name:"cause-list"},{path:"/cases/running/",name:"running-cases"},{path:"/clients/",name:"clients"}]) {
    try {
      await page.goto(s.path, { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `e2e/screenshots/ui-after/${s.name}-desktop.png`, fullPage: true });
    } catch (e: any) { console.log("FAIL", s.name, e.message); }
  }
});
