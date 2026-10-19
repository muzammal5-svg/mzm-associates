import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

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

const ROUTES: Array<string> = [
  "/",
  "/auth/forgot-password/",
  "/auth/reset-password/",
  "/auth/sign-in/",
  "/cases/",
  "/cases/decided/",
  "/cases/edit/",
  "/cases/new/",
  "/cases/running/",
  "/cases/view/",
  "/cause-list/",
  "/clients/",
  "/clients/edit/",
  "/clients/new/",
  "/clients/view/",
  "/design-system/",
  "/documents/",
  "/hearings/new/",
  "/help/",
  "/more/",
  "/notifications/",
  "/profile/",
  "/reminders/",
  "/settings/",
  "/settings/case-types/",
  "/settings/courts/",
  "/settings/notifications/",
  "/splash/",
];

const MATRIX_RESULTS: Array<{ role: string; vp: string; lang: string; route: string; status: string; reason?: string }> = [];

async function login(page: any, role: string) {
  const creds = CREDENTIALS[role];
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.waitForTimeout(300);
  const btn = page.locator('button[type="submit"]');
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.click();
  await page.waitForTimeout(3000);
}

async function switchLang(page: any, lang: string) {
  await page.evaluate((lng: any) => localStorage.setItem("i18nextLng", lng), lang);
  await page.reload();
  await page.waitForTimeout(1500);
}

function classifyError(err: any): { status: string; reason?: string } {
  const msg = err?.message || "";
  if (msg.includes("Target page, context or browser has been closed")) return { status: "BLOCKED", reason: "browser context closed" };
  if (msg.includes("net::ERR_ABORTED")) return { status: "FAIL", reason: "net::ERR_ABORTED" };
  if (msg.includes("Test timeout")) return { status: "BLOCKED", reason: "timeout" };
  if (msg.includes("net::ERR_CONNECTION_REFUSED")) return { status: "BLOCKED", reason: "connection refused" };
  return { status: "FAIL", reason: msg.substring(0, 80) };
}

for (const role of ["admin", "lawyer", "clerk"]) {
  for (const vp of ["mobile", "desktop"]) {
    for (const lang of ["en", "ur"]) {
      test(`ROUTE MATRIX: ${role} @ ${vp} @ ${lang}`, async ({ page }) => {
        await page.setViewportSize(VIEWPORTS[vp]);
        await login(page, role);
        await switchLang(page, lang);

        for (const route of ROUTES) {
          try {
            await page.goto(route, { timeout: 15000, waitUntil: "domcontentloaded" });
            await page.waitForTimeout(500);

            const bodyText = await page.locator("body").textContent();
            const isErrorPage = /page not found|not found|something went wrong/i.test(bodyText ?? "");
            const redirectedToSignIn = page.url().includes("/auth/sign-in") && route !== "/auth/sign-in/";

            if (isErrorPage || redirectedToSignIn) {
              MATRIX_RESULTS.push({ role, vp, lang, route, status: "FAIL", reason: redirectedToSignIn ? "redirected to sign-in" : "error page content" });
            } else {
              MATRIX_RESULTS.push({ role, vp, lang, route, status: "PASS" });
            }
          } catch (err: any) {
            const classified = classifyError(err);
            MATRIX_RESULTS.push({ role, vp, lang, route, status: classified.status, reason: classified.reason });
          }
        }

        const subset = MATRIX_RESULTS.filter(r => r.role === role && r.vp === vp && r.lang === lang);
        const pass = subset.filter(r => r.status === "PASS").length;
        const fail = subset.filter(r => r.status === "FAIL").length;
        const blocked = subset.filter(r => r.status === "BLOCKED").length;
        console.log(`\n=== ${role} @ ${vp} @ ${lang}: ${pass} PASS, ${fail} FAIL, ${blocked} BLOCKED ===`);
        for (const r of subset) {
          if (r.status !== "PASS") {
            console.log(`  ${r.status.padEnd(7)} ${r.route} — ${r.reason || ""}`);
          }
        }
      });
    }
  }
}

test("PRINT FULL MATRIX", async () => {
  console.log("\n========================================");
  console.log("FULL ROUTE MATRIX RESULTS");
  console.log("========================================");
  let totalPass = 0, totalFail = 0, totalBlocked = 0;
  for (const role of ["admin", "lawyer", "clerk"]) {
    for (const vp of ["mobile", "desktop"]) {
      for (const lang of ["en", "ur"]) {
        const subset = MATRIX_RESULTS.filter(r => r.role === role && r.vp === vp && r.lang === lang);
        const pass = subset.filter(r => r.status === "PASS").length;
        const fail = subset.filter(r => r.status === "FAIL").length;
        const blocked = subset.filter(r => r.status === "BLOCKED").length;
        totalPass += pass; totalFail += fail; totalBlocked += blocked;
        console.log(`${role.padEnd(8)} @ ${vp.padEnd(8)} @ ${lang}: ${pass} PASS, ${fail} FAIL, ${blocked} BLOCKED (${subset.length} routes)`);
        for (const r of subset) {
          if (r.status !== "PASS") {
            console.log(`    ${r.status.padEnd(7)} ${r.route} — ${r.reason || ""}`);
          }
        }
      }
    }
  }
  console.log(`\nOVERALL: ${totalPass} PASS, ${totalFail} FAIL, ${totalBlocked} BLOCKED (${MATRIX_RESULTS.length} total)`);

  // Write results to file
  const lines = ["role,vp,lang,route,status,reason"];
  for (const r of MATRIX_RESULTS) {
    lines.push(`${r.role},${r.vp},${r.lang},${r.route},${r.status},"${r.reason || ""}"`);
  }
  await writeFile("route-matrix-results.csv", lines.join("\n"));
  console.log("\nResults written to route-matrix-results.csv");
});
