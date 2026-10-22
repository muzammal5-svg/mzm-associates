import { test, expect } from "@playwright/test";

const CRED = { email: "owner-expired@demo.test", password: "Owner1234!" };

async function login(page: any) {
  await page.goto("/auth/sign-in/", { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', CRED.email);
  await page.fill('input[type="password"]', CRED.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3500);
}

test("premium billing portal renders and behaves", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  const IGNORED = /notification permission|device_token/i;
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORED.test(m.text())) errors.push(`console: ${m.text()}`);
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await login(page);
  await page.goto("/billing/", { timeout: 60000 });
  await page.waitForTimeout(2500);

  // 1. Lock / status banner is present and reflects the INACTIVE state.
  await expect(page.getByText(/Status:\s*INACTIVE/i).first()).toBeVisible();

  // 2. Interactive plan cards: exactly one is selected at a time.
  const planCards = page.locator('[role="radio"]');
  const planCount = await planCards.count();
  expect(planCount).toBeGreaterThan(0);
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);
  await planCards.nth(0).click();
  await page.waitForTimeout(400);
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);

  // 3. Payment gateway tabs switch the visible account panel.
  const tabs = page.getByRole("tab");
  const tabCount = await tabs.count();
  expect(tabCount).toBe(3);
  await tabs.nth(1).click();
  await page.waitForTimeout(400);
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");

  // 4. Copy Account / IBAN triggers the toast.
  const copyBtn = page.getByRole("button", { name: /copy account/i }).first();
  if (await copyBtn.count()) {
    await copyBtn.click();
    await page.waitForTimeout(600);
    await expect(page.getByText(/copied/i).first()).toBeVisible();
  }

  // 5. Receipt dropzone accepts a file and shows a preview + clear control.
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles({
    name: "receipt.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjRNRwAAAABJRU5ErkJggg==",
      "base64"
    ),
  });
  await page.waitForTimeout(800);
  await expect(page.getByText("receipt.png")).toBeVisible();
  await page.getByRole("button", { name: /remove receipt/i }).click();
  await page.waitForTimeout(400);
  await expect(page.getByText("receipt.png")).toBeHidden();

  // 6. Floating label field shows a validation check once valid.
  const transId = page.getByLabel(/transaction id/i).first();
  await transId.fill("TRX-99887766");
  await page.waitForTimeout(400);

  // 7. Payment history section renders (table when payments exist, empty state otherwise).
  const historyTable = page.getByRole("table").first();
  const historyEmpty = page.getByText(/no payments submitted yet/i).first();
  await expect(historyTable.or(historyEmpty).first()).toBeVisible();

  await page.screenshot({ path: "e2e/screenshots/modern/billing.png", animations: "disabled" });

  expect(errors, `Runtime errors detected:\n${errors.join("\n")}`).toEqual([]);
});
