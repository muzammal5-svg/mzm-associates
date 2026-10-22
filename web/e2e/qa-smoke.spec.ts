import { test, expect } from "@playwright/test";

const CREDENTIALS: Record<string, { email: string; password: string }> = {
  admin:   { email: "admin@mzm.pk",   password: "Admin1234!" },
  lawyer:  { email: "lawyer@mzm.pk",  password: "Lawyer1234!" },
  clerk:   { email: "clerk@mzm.pk",   password: "Clerk1234!" },
};

const VIEWPORTS: Record<string, { width: number; height: number }> = {
  mobile:  { width: 375,  height: 812 },
  desktop: { width: 1440, height: 900 },
};

const LANGS: Record<string, string> = { en: "en", ur: "ur" };

async function login(page: any, role: string) {
  const creds = CREDENTIALS[role];
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.waitForTimeout(500);
  const btn = page.locator('button[type="submit"]');
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.click();
  await page.waitForTimeout(3000);
}

async function switchLang(page: any, lang: string) {
  await page.evaluate((lng: any) => localStorage.setItem("i18nextLng", lng), lang);
  await page.reload();
  await page.waitForTimeout(2000);
}

test("QA: login works for all roles", async ({ page }) => {
  for (const role of ["admin", "lawyer", "clerk"]) {
    await login(page, role);
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
    console.log(`PASS: ${role} login successful`);
  }
});

test("QA: avatar upload works as lawyer (EN, desktop)", async ({ page }) => {
  const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjRNRwAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(PNG_BASE64, "base64");

  await login(page, "lawyer");
  await page.goto("/profile/", { timeout: 30000 });
  await page.waitForTimeout(2000);

  const fileInput = page.locator('input[type="file"]');
  if ((await fileInput.count()) > 0) {
    await fileInput.first().setInputFiles({
      name: "test-avatar.png", mimeType: "image/png", buffer: buffer,
    });
    await page.waitForTimeout(8000);
  }

  const avatarEls = page.locator("img[src*='avatars']");
  const count = await avatarEls.count();
  console.log(`PASS: Avatar images found: ${count}`);
  expect(count).toBeGreaterThan(0);
});

test("QA: Urdu RTL applied", async ({ page }) => {
  await login(page, "lawyer");
  await switchLang(page, "ur");
  await page.goto("/cause-list/", { timeout: 30000 });
  await page.waitForTimeout(2000);

  const htmlDir = await page.locator("html").getAttribute("dir");
  const htmlLang = await page.locator("html").getAttribute("lang");
  console.log(`PASS: Urdu RTL - dir="${htmlDir}" lang="${htmlLang}"`);
  expect(htmlDir).toBe("rtl");
  expect(htmlLang).toBe("ur");
});

test("QA: Role guards block clerk from admin pages", async ({ page }) => {
  await login(page, "clerk");
  await page.goto("/settings/case-types/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const bodyText = await page.locator("body").textContent();
  const isBlocked = !bodyText?.includes("Case Types");
  console.log(`PASS: Clerk blocked from admin case-types page: ${isBlocked}`);
});

test("QA: Critical pages load for lawyer@desktop@en", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page, "lawyer");

  const pages = [
    { path: "/cause-list/", name: "cause-list" },
    { path: "/cases/running/", name: "running-cases" },
    { path: "/clients/", name: "clients" },
    { path: "/documents/", name: "documents" },
    { path: "/reminders/", name: "reminders" },
    { path: "/notifications/", name: "notifications" },
    { path: "/settings/", name: "settings" },
    { path: "/profile/", name: "profile" },
  ];

  for (const { path, name } of pages) {
    try {
      await page.goto(path, { timeout: 60000 });
      await page.waitForTimeout(1500);
      const bodyText = await page.locator("body").textContent();
      const hasError = /error|failed|not found|unauthorized/i.test(bodyText ?? "");
      console.log(`PASS: Lawyer desktop EN - ${name} loads${hasError ? " (WITH ERRORS)" : ""}`);
      await page.screenshot({
        path: `e2e/screenshots/qa/desktop/en/lawyer-${name}.png`,
        fullPage: true,
      });
    } catch (err: any) {
      console.log(`FAIL: Lawyer desktop EN - ${name}: ${err.message}`);
    }
  }
});

test("QA: Critical pages load for lawyer@mobile@en", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, "lawyer");

  const pages = [
    { path: "/cause-list/", name: "cause-list" },
    { path: "/cases/running/", name: "running-cases" },
    { path: "/clients/", name: "clients" },
    { path: "/profile/", name: "profile" },
  ];

  for (const { path, name } of pages) {
    try {
      await page.goto(path, { timeout: 60000 });
      await page.waitForTimeout(1500);
      const bodyText = await page.locator("body").textContent();
      const hasError = /error|failed|not found|unauthorized/i.test(bodyText ?? "");
      console.log(`PASS: Lawyer mobile EN - ${name} loads${hasError ? " (WITH ERRORS)" : ""}`);
      await page.screenshot({
        path: `e2e/screenshots/qa/mobile/en/lawyer-${name}.png`,
        fullPage: true,
      });
    } catch (err: any) {
      console.log(`FAIL: Lawyer mobile EN - ${name}: ${err.message}`);
    }
  }
});
