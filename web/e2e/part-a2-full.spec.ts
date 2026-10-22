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

for (const vp of [{w:375,h:812,label:"mobile"},{w:1440,h:900,label:"desktop"}]) {
  for (const lng of ["en","ur"]) {
    test(`routing ${vp.label} ${lng}`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto("/auth/sign-in/", { timeout: 60000 });
      await page.evaluate((l) => localStorage.setItem("i18nextLng", l), lng);
      await page.reload();
      await page.waitForTimeout(1000);
      for (const f of FIRMS) {
        await login(page, f.email, f.password);
        await page.goto("/", { timeout: 60000 });
        await page.waitForTimeout(2000);
        const url = page.url();
        const banner = await page.locator("text=Read-only").count();
        await page.goto("/clients/new/", { timeout: 60000 });
        await page.waitForTimeout(1500);
        const clientsUrl = page.url();
        console.log(`VP=${vp.label} LNG=${lng} STATE=${f.state} landing=${url} banner=${banner>0} clientsNew=${clientsUrl}`);
        await page.context().clearCookies();
      }
    });
  }
}
