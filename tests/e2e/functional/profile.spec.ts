import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
    test('should allow a client to update their profile', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'client@example.com');
        await page.fill('input[name="password"]', 'Test@123456');
        await page.click('button[type="submit"]');

        await page.goto('/profile');
        await page.fill('input[name="fullName"]', 'John Doe');
        await page.fill('input[name="phone"]', '+1234567890');
        await page.fill('input[name="address"]', '123 Main St, New York, NY');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });

    test('should allow a provider to create their profile', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'provider@example.com');
        await page.fill('input[name="password"]', 'Test@123456');
        await page.click('button[type="submit"]');

        await page.goto('/provider/setup');

        // Fill provider details
        await page.fill('input[name="fullName"]', 'Jane Smith');
        await page.selectOption('select[name="category"]', 'Plumber');
        await page.fill('input[name="experienceYears"]', '5');
        await page.fill('textarea[name="bio"]', 'Professional plumber with 5 years experience');

        // Set operating location
        await page.fill('input[name="location"]', 'Brooklyn, NY');
        await page.fill('input[name="serviceRadius"]', '15');

        await page.click('button:has-text("Create Provider Profile")');
        await expect(page.locator('text=Provider profile created')).toBeVisible();
    });

    test('should display provider profile with rating', async ({ page }) => {
        await page.goto('/providers/test-provider-id');

        // Verify provider details are displayed
        await expect(page.locator('.provider-name')).toBeVisible();
        await expect(page.locator('.provider-category')).toBeVisible();
        await expect(page.locator('.provider-rating')).toBeVisible();
        await expect(page.locator('.total-jobs')).toBeVisible();
        await expect(page.locator('.verification-badge')).toBeVisible();
    });
});
