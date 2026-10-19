import { test, expect } from "@playwright/test";

async function login(page: any, email: string, password: string) {
  await page.goto("/auth/sign-in/", { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

test("grace controls disabled", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, "owner-grace@demo.test", "Owner1234!");
  await page.goto("/clients/new/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const submit = page.locator('button[type="submit"]').first();
  const disabled = await submit.evaluate((el: any) => el.disabled);
  console.log("grace submit disabled:", disabled);
  expect(disabled).toBe(true);
});

test("active controls enabled", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, "owner-active@demo.test", "Owner1234!");
  await page.goto("/clients/new/", { timeout: 30000 });
  await page.waitForTimeout(2000);
  const submit = page.locator('button[type="submit"]').first();
  const disabled = await submit.evaluate((el: any) => el.disabled);
  console.log("active submit disabled:", disabled);
  expect(disabled).toBe(false);
});
