
import { test, expect } from '@playwright/test';

test.describe('Client Webapp Smoke Tests', () => {

    test('Home Page loads and displays sections', async ({ page }) => {
        await page.goto('/');

        // Check Title
        await expect(page).toHaveTitle(/The Lokals/);

        // Check Hero text
        await expect(page.getByText('Expert Help,')).toBeVisible();

        // Check Sections
        await expect(page.getByRole('heading', { name: 'Home Services' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Rentals' })).toBeVisible();

        // Check Service Grid (3-col check is hard visually in headless, but ensures elements exist)
        const serviceLinks = page.locator('a[href^="/services/"]');
        await expect(serviceLinks.first()).toBeVisible();
    });

    test('Service Detail Page loads correctly', async ({ page }) => {
        await page.goto('/');

        // Click the first service in "Home Services" section
        // Assuming the first grid is Home Services
        const firstService = page.locator('a[href^="/services/"]').first();
        await firstService.click();

        // Verify URL
        await expect(page).toHaveURL(/\/services\//);

        // Check for "Book Service" button to confirm no crash
        await expect(page.getByRole('button', { name: 'Book Service' })).toBeVisible();
    });

    test('Footer link points to prod', async ({ page }) => {
        await page.goto('/');
        const proLink = page.getByRole('link', { name: 'Register as Pro' });
        await expect(proLink).toHaveAttribute('href', 'https://www.thelocals.co.in');
    });

});
