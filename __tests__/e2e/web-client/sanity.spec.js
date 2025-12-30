const { test, expect } = require('@playwright/test');

test('sanity', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
});
