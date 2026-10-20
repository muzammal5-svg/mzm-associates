import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "e2e/screenshots/landing/after";
mkdirSync(`${OUT}/mobile`, { recursive: true });
mkdirSync(`${OUT}/desktop`, { recursive: true });

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1440, height: 900 };

async function loggedOut(page: import("@playwright/test").Page) {
  await page.context().clearCookies();
  await page.goto("/", { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => localStorage.clear()).catch(() => {});
}

// Reveal-on-scroll sections stay at opacity-0 until they intersect, so a full-page
// screenshot has to scroll the page first.
async function revealAll(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.5);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

test("landing: logged-out / shows landing within 1s without URL change", async ({ page }) => {
  for (const [name, vp] of [["mobile", MOBILE], ["desktop", DESKTOP]] as const) {
    await page.setViewportSize(vp);
    await loggedOut(page);
    const t0 = Date.now();
    await page.goto("/", { timeout: 30000 });
    await expect(page.locator("h1")).toBeVisible({ timeout: 1000 });
    const ms = Date.now() - t0;
    console.log(`landing visible in ${ms}ms (${name})`);
    expect(page.url()).toMatch(/\/$/);
    const h1Color = await page.locator("h1").first().evaluate((el) => getComputedStyle(el).color);
    console.log(`hero h1 color (${name}): ${h1Color}`);
    expect(h1Color).toBe("rgb(255, 255, 255)");
    await revealAll(page);
    await page.screenshot({ path: `${OUT}/${name}/home-landing.png`, fullPage: true });
  }
});

test("landing: header drawer opens on mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await loggedOut(page);
  await page.goto("/", { timeout: 30000 });
  await page.locator('button[aria-label="Menu"]').click();
  await expect(page.locator('a[href^="/auth/sign-in"]:visible')).toBeVisible();
  await page.screenshot({ path: `${OUT}/mobile/header-drawer.png` });
});

test("landing: Sign in goes to /auth/sign-in", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await loggedOut(page);
  await page.goto("/", { timeout: 30000 });
  await page.locator('a[href^="/auth/sign-in"]').first().click();
  await expect(page).toHaveURL(/\/auth\/sign-in\/?$/);
});

test("landing: Sign up goes to /register", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await loggedOut(page);
  await page.goto("/", { timeout: 30000 });
  await page.locator('a[href^="/register"]').first().click();
  await expect(page).toHaveURL(/\/register\/?$/);
  await page.screenshot({ path: `${OUT}/desktop/register.png`, fullPage: true });
});

test("landing: pricing plan CTA carries ?plan= into register", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await loggedOut(page);
  await page.goto("/", { timeout: 30000 });
  const cta = page.locator('a[href*="/register/?plan="]').first();
  await expect(cta).toBeVisible({ timeout: 15000 });
  const href = await cta.getAttribute("href");
  console.log("plan CTA href:", href);
  expect(href).toMatch(/\/register\/?\?plan=/);
  await cta.click();
  await expect(page).toHaveURL(/\/register\/?\?plan=[a-z_]+/);
});

test("landing: no horizontal overflow on public routes", async ({ page }) => {
  for (const [name, vp] of [["mobile", MOBILE], ["desktop", DESKTOP]] as const) {
    await page.setViewportSize(vp);
    for (const route of ["/", "/welcome/", "/pricing/", "/register"]) {
      await loggedOut(page);
      await page.goto(route, { timeout: 30000 });
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      console.log(`overflow ${route} ${name}: ${overflow}px`);
      expect(overflow).toBeLessThanOrEqual(0);
    }
  }
});

test("landing: reviews hidden when SHOW_REVIEWS=false", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await loggedOut(page);
  await page.goto("/", { timeout: 30000 });
  await expect(page.locator("text=What lawyers say")).toHaveCount(0);
});

test("landing: Urdu is RTL with no leftover English headings", async ({ page }) => {
  for (const [name, vp] of [["mobile", MOBILE], ["desktop", DESKTOP]] as const) {
    await page.setViewportSize(vp);
    await loggedOut(page);
    await page.goto("/", { timeout: 30000 });
    await page.evaluate(() => localStorage.setItem("i18nextLng", "ur"));
    await page.goto("/", { timeout: 30000 });
    await expect(page.locator("h1")).toBeVisible({ timeout: 3000 });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ur");
    await expect(page.getByRole("heading", { name: "قیمتیں" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pricing" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "How it works" })).toHaveCount(0);
    await revealAll(page);
    await page.screenshot({ path: `${OUT}/${name}/home-landing-ur.png`, fullPage: true });
  }
});
