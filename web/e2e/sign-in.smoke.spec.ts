import { expect, test } from "@playwright/test";
test("opens the sign-in page", async ({ page }) => {
  await page.goto("/auth/sign-in/");
  await expect(page).toHaveURL(/\/auth\/sign-in\//);
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});
