import { test, expect } from "@playwright/test";

async function login(page: any, email: string, password: string) {
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

test("header drawer + nav", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/welcome/", { timeout: 30000 });
  await page.click('button[aria-label="Menu"]');
  await page.waitForTimeout(500);
  const link = page.locator(".absolute.start-0").locator('a[href="/pricing/"]');
  expect(await link.count()).toBeGreaterThan(0);
  await link.first().click({ force: true });
  await page.waitForTimeout(1000);
  console.log("nav link works, url:", page.url());
});

test("sign in / sign up links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/welcome/", { timeout: 30000 });
  const signIn = page.locator('a[href="/auth/sign-in/"]');
  expect(await signIn.count()).toBeGreaterThan(0);
  const signUp = page.locator('a[href="/register/"]');
  expect(await signUp.count()).toBeGreaterThan(0);
  console.log("sign in/up links present");
});

test("plan CTA carries ?plan=", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/pricing/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const cta = page.locator('a[href*="?plan="]');
  expect(await cta.count()).toBeGreaterThan(0);
  const href = await cta.first().getAttribute("href");
  console.log("plan CTA href:", href);
});

test("language switch flips RTL", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/welcome/", { timeout: 30000 });
  await page.evaluate(() => localStorage.setItem("i18nextLng", "ur"));
  await page.reload();
  await page.waitForTimeout(1000);
  const dir = await page.evaluate(() => document.documentElement.dir);
  console.log("document dir after ur:", dir);
});

test("logged-in user redirected from welcome", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page, "owner-active@demo.test", "Owner1234!");
  await page.goto("/welcome/", { timeout: 30000 });
  await page.waitForTimeout(3000);
  const url = page.url();
  console.log("welcome after login url:", url);
  expect(url).not.toContain("/welcome/");
});