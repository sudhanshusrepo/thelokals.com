
import { test, expect } from '@playwright/test';

test.describe('Admin App Inspection', () => {
    test.use({
        baseURL: 'http://localhost:3002',
        viewport: { width: 1920, height: 1080 }
    }); // Explicitly set Admin Port & Viewport

    test('Login and Inspect Dashboard', async ({ page }) => {
        // Capture console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // 1. Visit Login
        await page.goto('/login');
        // Verify H1 instead of title which might be generic
        await expect(page.getByRole('heading', { name: 'Admin Portal' })).toBeVisible();

        // 2. Login
        await page.fill('input[type="email"]', 'admin@thelokals.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Debug: Log URL after login click
        console.log('Post-click URL:', page.url());

        // Wait for potential redirect or error
        await page.waitForTimeout(2000);
        console.log('Waited URL:', page.url());

        // Take screenshot of whatever is on screen
        await page.screenshot({ path: 'e2e/screenshots/admin_login_result.png' });

        // 3. Verify Dashboard (Relaxed URL check)
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        await page.screenshot({ path: 'e2e/screenshots/admin_dashboard.png' });

        // 4. Inspect Providers
        await page.getByText('Verifications', { exact: false }).first().click({ force: true });
        await expect(page).toHaveURL(/\/verifications/);
        // Expect either 'Pending' or 'All Caught Up' (resilient to data state)
        await expect(page.getByText('Pending').or(page.getByText('All Caught Up!', { exact: false }))).toBeVisible();
        await page.screenshot({ path: 'e2e/screenshots/admin_verifications.png' });
    });
});
