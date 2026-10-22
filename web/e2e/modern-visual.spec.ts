import { test, expect } from "@playwright/test";

/**
 * Smoke test for the refreshed marketing + billing surfaces.
 * Verifies the pages render without runtime/console errors and captures
 * desktop + mobile screenshots into e2e/screenshots/modern/.
 */
const ROUTES = ["/", "/pricing/", "/register/", "/terms/", "/privacy/"];

test("modern marketing surfaces render cleanly", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];

  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });

  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of ROUTES) {
    await page.goto(route, { timeout: 60000 });
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toBeVisible();
  }

  await page.goto("/", { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/modern/landing-hero.png", animations: "disabled" });

  // Legal slide-over drawer opens from the footer.
  const termsBtn = page.getByRole("button", { name: /terms/i }).first();
  await expect(termsBtn).toBeVisible();
  await termsBtn.click();
  await page.waitForTimeout(800);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "e2e/screenshots/modern/legal-drawer.png", animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  // Mobile landing
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "e2e/screenshots/modern/landing-mobile.png", animations: "disabled" });

  expect(errors, `Runtime errors detected:\n${errors.join("\n")}`).toEqual([]);
});
