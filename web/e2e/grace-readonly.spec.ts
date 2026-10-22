import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const bundles = {
  en: JSON.parse(readFileSync(resolve(__dirname, "../i18n/locales/en.json"), "utf8")),
  ur: JSON.parse(readFileSync(resolve(__dirname, "../i18n/locales/ur.json"), "utf8")),
} as Record<string, any>;

type Lang = "en" | "ur";

function text(lang: Lang, key: string): string {
  return key.split(".").reduce((node: any, part) => node?.[part], bundles[lang]);
}

const PASSWORD = "Owner1234!";
const FIRMS = [
  { key: "grace",  email: "owner-grace@demo.test",  expectLocked: true },
  { key: "active", email: "owner-active@demo.test", expectLocked: false },
] as const;

const VIEWPORTS = [
  { key: "mobile", size: { width: 375,  height: 812 } },
  { key: "desktop", size: { width: 1440, height: 900 } },
] as const;

const LANGS: Lang[] = ["en", "ur"];

// Read-only targets: every entry names a control the firm would normally use to write.
const TARGETS = [
  { key: "clients-new",   path: "/clients/new/",   label: (l: Lang) => text(l, "clients.saveContinue") },
  { key: "courts-add",    path: "/settings/courts/", label: (l: Lang) => text(l, "common.addNew") },
  { key: "profile-save",  path: "/profile/",       label: (l: Lang) => text(l, "common.save") },
] as const;

const SHOT_DIR = resolve(__dirname, "screenshots/grace-readonly");

async function signIn(page: Page, email: string) {
  await page.goto("/auth/sign-in/", { timeout: 30_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/^http:\/\/127\.0\.0\.1:3100\/?$/, { timeout: 30_000 });
}

test.describe.configure({ mode: "serial" });
test.beforeAll(() => mkdirSync(SHOT_DIR, { recursive: true }));

for (const viewport of VIEWPORTS) {
  for (const lang of LANGS) {
    for (const firm of FIRMS) {
      test(`grace-readonly: ${firm.key} firm, ${viewport.key} ${viewport.size.width}x${viewport.size.height}, ${lang.toUpperCase()}`, async ({ page }) => {
        await page.setViewportSize(viewport.size);
        await page.addInitScript(value => localStorage.setItem("i18nextLng", value), lang);

        await signIn(page, firm.email);

        for (const target of TARGETS) {
          await page.goto(target.path, { timeout: 30_000 });
          const control = page.getByRole("button", { name: target.label(lang) }).first();
          await expect(control).toBeVisible({ timeout: 15_000 });

          if (firm.expectLocked) {
            await expect(control).toBeDisabled();
            await expect(control).toHaveAttribute("aria-disabled", "true");
            await expect(control).toHaveAttribute("title", text(lang, "subscription.renewToEdit"));
          } else {
            await expect(control).toBeEnabled();
            const title = await control.getAttribute("title");
            expect(title === null || title === "").toBeTruthy();
          }

          await page.screenshot({
            path: resolve(SHOT_DIR, `${firm.key}-${viewport.key}-${lang}-${target.key}.png`),
            fullPage: true,
          });
        }

        // Account security stays available even while the workspace is read-only.
        await page.goto("/profile/", { timeout: 30_000 });
        await expect(page.getByRole("button", { name: text(lang, "profile.changePassword") }).first()).toBeEnabled();

        // Exactly one subscription banner, and only in grace.
        await page.goto("/settings/courts/", { timeout: 30_000 });
        const notices = page.getByText(text(lang, "subscription.graceNotice"));
        const renewLinks = page.getByRole("link", { name: text(lang, "subscription.renew") });
        if (firm.expectLocked) {
          await expect(notices).toHaveCount(1);
          await expect(renewLinks).toHaveCount(1);
          await expect(renewLinks.first()).toHaveAttribute("href", /\/billing\/?$/);
        } else {
          await expect(notices).toHaveCount(0);
          await expect(renewLinks).toHaveCount(0);
        }
      });
    }
  }
}
