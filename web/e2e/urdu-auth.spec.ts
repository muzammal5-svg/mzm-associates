import { expect, test } from "@playwright/test";

const AUTH_SCREENS: Array<{ path: string; name: string }> = [
  { path: "/cause-list/", name: "cause-list" },
  { path: "/cases/running/", name: "running-cases" },
  { path: "/clients/", name: "clients" },
  { path: "/documents/", name: "documents" },
  { path: "/reminders/", name: "reminders" },
  { path: "/notifications/", name: "notifications" },
  { path: "/settings/", name: "settings" },
];

test("Urdu authenticated screenshots", async ({ page }) => {
  // ── Login as lawyer ──
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', "lawyer@mzm.pk");
  await page.fill('input[type="password"]', "Lawyer1234!");
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(3000);

  // ── Switch to Urdu via localStorage ──
  await page.evaluate(() => localStorage.setItem("i18nextLng", "ur"));
  await page.reload();
  await page.waitForTimeout(2000);

  // ── Screenshot each authenticated screen ──
  for (const { path, name } of AUTH_SCREENS) {
    await page.goto(path, { timeout: 30000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `e2e/screenshots/ur-auth/${name}.png`,
      fullPage: true,
    });
  }
});
