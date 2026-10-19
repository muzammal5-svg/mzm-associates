import { test } from "@playwright/test";

const FIRMS = [
  { email: "owner-trial@demo.test", password: "Owner1234!", state: "trial" },
  { email: "owner-active@demo.test", password: "Owner1234!", state: "active" },
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

test("routing by subscription state", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const f of FIRMS) {
    await login(page, f.email, f.password);
    await page.goto("/", { timeout: 30000 });
    await page.waitForTimeout(2000);
    const url = page.url();
    const banner = await page.locator("text=Read-only").count();
    console.log(`STATE ${f.state}: url=${url} banner=${banner>0}`);
    // try add client
    await page.goto("/clients/new/", { timeout: 30000 });
    await page.waitForTimeout(1500);
    console.log(`  clients/new url after guard: ${page.url()}`);
    await page.context().clearCookies();
  }
});
