import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow a user to login', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'Test@123456');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should allow a user to register', async ({ page }) => {
        await page.goto('/register');
        await page.fill('input[name="email"]', 'newuser@example.com');
        await page.fill('input[name="password"]', 'Test@123456');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });
});
