import { test } from "@playwright/test";

const UR_SCREENS: Array<{ path: string; name: string }> = [
  { path: "/", name: "home" },
  { path: "/auth/sign-in/", name: "sign-in" },
  { path: "/help/", name: "help" },
  { path: "/more/", name: "more" },
];

test("Urdu screenshots for public screens", async ({ page }) => {
  await page.goto("/auth/sign-in/");
  await page.evaluate(() => localStorage.setItem("i18nextLng", "ur"));
  await page.reload();
  await page.waitForTimeout(1500);

  for (const { path, name } of UR_SCREENS) {
    await page.goto(path);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `e2e/screenshots/ur/${name}.png`,
      fullPage: true,
    });
  }
});
