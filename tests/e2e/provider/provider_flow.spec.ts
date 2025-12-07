import { test, expect } from '@playwright/test';

test.describe('Provider App v1.0 E2E', () => {

    test('Provider Landing Page loads correctly', async ({ page }) => {
        // Navigate to provider app (Vite default port 5173)
        await page.goto('http://localhost:5173');

        // Verify Landing Page Content
        await expect(page.getByText('Grow Your Business with')).toBeVisible();
        await expect(page.getByText('thelokals')).toBeVisible();

        // Verify Get Started button exists
        await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    });

    test('Auth Modal opens on Get Started', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Click Get Started
        await page.getByRole('button', { name: 'Get Started' }).click();

        // Verify Auth Modal
        // It selects "Sign Up" tab by default which shows "Join as Partner"
        await expect(page.getByText('Join as Partner')).toBeVisible();
        await expect(page.getByText('Start earning more with thelokals')).toBeVisible();

        // Check Tabs
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    });

    // Note: Wizard Flow requires authentication. 
    // We would need to login programmatically to test the wizard route which is conditional.
    // For now, these basic availability tests verify the overhauled UI components are reachable.
});
