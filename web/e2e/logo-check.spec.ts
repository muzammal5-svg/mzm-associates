import { expect, test } from "@playwright/test";

test("logo check screenshots", async ({ page }) => {
  // Sign-in page
  await page.goto("/auth/sign-in/");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/logo-signin.png", fullPage: true });

  // Splash screen
  await page.goto("/splash/");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/logo-splash.png", fullPage: true });

  // Desktop header (cause list page - desktop layout shows TopBar)
  await page.goto("/cause-list/");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/logo-desktop-header.png", fullPage: true });

  // Mobile header - set viewport to mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/cause-list/");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "e2e/screenshots/logo-mobile-header.png", fullPage: true });

  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});
