import { test, expect } from '@playwright/test';

test.describe('Web Client - Smoke Tests', () => {
    test('Home page loads successfully', async ({ page }) => {
        await page.goto('/');

        // Check if page loads
        await expect(page).toHaveTitle(/Lokals/i);

        // Check for main elements
        await expect(page.locator('text=Lokals').first()).toBeVisible();
    });

    test('Service selection page exists', async ({ page }) => {
        // Navigate to a service page
        await page.goto('/services/ac-repair');

        // Should not be 404
        await expect(page.locator('text=404')).not.toBeVisible();
    });

    test('Live request page exists', async ({ page }) => {
        // Navigate to live request page
        await page.goto('/live-request/test-123');

        // Should load the page
        await expect(page).toHaveURL(/\/live-request\//);
    });

    test('Rating page exists', async ({ page }) => {
        // Navigate to rating page
        await page.goto('/rating/test-123');

        // Should load the page
        await expect(page).toHaveURL(/\/rating\//);
    });

    test('Requests history page exists', async ({ page }) => {
        // Navigate to requests page
        await page.goto('/requests');

        // Should load the page
        await expect(page).toHaveURL(/\/requests/);
    });
});
