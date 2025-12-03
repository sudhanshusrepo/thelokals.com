import { test, expect } from '@playwright/test';

test.describe('Provider App v1.0 E2E', () => {

    test('Provider Landing Page loads correctly', async ({ page }) => {
        // Navigate to provider app (Vite default port 5173)
        await page.goto('http://localhost:5173');

        // Verify Header
        await expect(page.getByAltText('thelokals logo')).toBeVisible();
        await expect(page.getByText('thelokals.com')).toBeVisible();

        // Verify Content (adjust based on actual landing page content)
        // For now, we check for the header which we know exists
    });

    test('Registration Wizard Flow', async ({ page }) => {
        await page.goto('http://localhost:5173/register');

        // Verify we are on registration page
        await expect(page.getByText('Registration')).toBeVisible();

        // Check for form elements (assuming phone input exists)
        // await expect(page.getByPlaceholder('Phone Number')).toBeVisible();
    });
});
