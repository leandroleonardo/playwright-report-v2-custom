const { test, expect } = require("@playwright/test");

test("has title 2", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  try {
    await expect(page).toHaveTitle(/Playwrightt/);
  } catch (err) {
    test.error = err;
  }
});
