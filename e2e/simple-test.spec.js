const { test, expect } = require('@playwright/test');

test('simple js test', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
});
