import { test, expect } from "@playwright/test";

const FIRMS = [
  { email: "owner-grace@demo.test", password: "Owner1234!", state: "grace" },
  { email: "owner-expired@demo.test", password: "Owner1234!", state: "expired" },
];

async function login(page: any, email: string, password: string) {
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

test("grace/expired add client blocked", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const f of FIRMS) {
    await login(page, f.email, f.password);
    await page.goto("/clients/new/", { timeout: 30000 });
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`STATE=${f.state} clients/new url=${url} (expect /billing for expired)`);
    await page.context().clearCookies();
  }
});
