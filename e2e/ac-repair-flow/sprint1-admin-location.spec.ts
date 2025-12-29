/**
 * Sprint 1: Admin + Location Enablement E2E Tests
 * Tests admin login, service enablement for Gurugram/Navi Mumbai, and production mode
 */

import { test, expect } from '@playwright/test';
import { adminHelpers } from '../helpers/ac-repair-helpers';

test.describe('Sprint 1: Admin + Location Enablement', () => {
    test.use({
        baseURL: 'http://localhost:3001', // Admin app
        viewport: { width: 1920, height: 1080 }
    });

    // ============================================================================
    // TC1.1: Admin Login
    // ============================================================================
    test('TC1.1: Admin can login successfully', async ({ page }) => {
        // Navigate to admin app
        await page.goto('/');

        // Should redirect to login if not authenticated
        await expect(page).toHaveURL(/login|signin/);

        // Fill login form
        await page.fill('input[type="email"]', 'admin@thelokals.com');
        await page.fill('input[type="password"]', 'Admin@123');

        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        await expect(page).toHaveURL(/dashboard/);

        // Verify admin role is displayed
        await expect(page.locator('text=Super Admin')).toBeVisible();
    });

    // ============================================================================
    // TC1.2: Enable AC Repair for Gurugram
    // ============================================================================
    test('TC1.2: Admin can enable AC Repair for Gurugram', async ({ page }) => {
        // Login as admin
        await adminHelpers.login(page);

        // Navigate to location manager
        await page.click('a[href*="location"]');
        await page.waitForLoadState('networkidle');

        // Verify page loaded
        await expect(page.locator('h1:has-text("Location")')).toBeVisible();

        // Find AC Repair service row
        const acRepairRow = page.locator('tr:has-text("AC")').first();
        await expect(acRepairRow).toBeVisible();

        // Find Gurugram toggle
        const gurugramToggle = acRepairRow.locator('[data-location="Gurugram"]');

        // Enable if not already enabled
        const isEnabled = await gurugramToggle.isChecked();
        if (!isEnabled) {
            await gurugramToggle.click();

            // Save changes
            await page.click('button:has-text("Save")');
            await expect(page.locator('text=saved')).toBeVisible({ timeout: 5000 });
        }

        // Verify enabled state
        await expect(gurugramToggle).toBeChecked();
    });

    // ============================================================================
    // TC1.3: Enable AC Repair for Navi Mumbai
    // ============================================================================
    test('TC1.3: Admin can enable AC Repair for Navi Mumbai', async ({ page }) => {
        // Login as admin
        await adminHelpers.login(page);

        // Navigate to location manager
        await page.click('a[href*="location"]');
        await page.waitForLoadState('networkidle');

        // Find AC Repair service row
        const acRepairRow = page.locator('tr:has-text("AC")').first();
        await expect(acRepairRow).toBeVisible();

        // Find Navi Mumbai toggle
        const naviMumbaiToggle = acRepairRow.locator('[data-location="Navi Mumbai"]');

        // Enable if not already enabled
        const isEnabled = await naviMumbaiToggle.isChecked();
        if (!isEnabled) {
            await naviMumbaiToggle.click();

            // Save changes
            await page.click('button:has-text("Save")');
            await expect(page.locator('text=saved')).toBeVisible({ timeout: 5000 });
        }

        // Verify enabled state
        await expect(naviMumbaiToggle).toBeChecked();
    });

    // ============================================================================
    // TC1.4: Set Production Mode for AC Repair
    // ============================================================================
    test('TC1.4: Admin can set production mode for AC Repair', async ({ page }) => {
        // Login as admin
        await adminHelpers.login(page);

        // Navigate to location manager
        await page.click('a[href*="location"]');
        await page.waitForLoadState('networkidle');

        // Find AC Repair service row
        const acRepairRow = page.locator('tr:has-text("AC")').first();
        await expect(acRepairRow).toBeVisible();

        // Find production mode toggle
        const prodModeToggle = acRepairRow.locator('[data-production-mode="true"]');

        // Enable if not already enabled
        const isProdMode = await prodModeToggle.isChecked();
        if (!isProdMode) {
            await prodModeToggle.click();

            // Save changes
            await page.click('button:has-text("Save")');
            await expect(page.locator('text=saved')).toBeVisible({ timeout: 5000 });
        }

        // Verify production mode enabled
        await expect(prodModeToggle).toBeChecked();
    });

    // ============================================================================
    // TC1.5: Verify services_locations table updated (Backend)
    // ============================================================================
    test('TC1.5: Verify services_locations table has correct entries', async ({ page }) => {
        // This test would use Supabase MCP to verify database state
        // For now, we'll use API route to check

        // Login as admin
        await adminHelpers.login(page);

        // Make API call to verify services_locations
        const response = await page.request.get('http://localhost:54321/rest/v1/services_locations', {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
            }
        });

        expect(response.ok()).toBeTruthy();

        const data = await response.json();

        // Verify Gurugram entry exists
        const gurugramEntry = data.find((entry: any) =>
            entry.location_name === 'Gurugram' &&
            entry.enabled === true &&
            entry.production_mode === true
        );
        expect(gurugramEntry).toBeDefined();

        // Verify Navi Mumbai entry exists
        const naviMumbaiEntry = data.find((entry: any) =>
            entry.location_name === 'Navi Mumbai' &&
            entry.enabled === true &&
            entry.production_mode === true
        );
        expect(naviMumbaiEntry).toBeDefined();
    });

    // ============================================================================
    // TC1.6: Verify Client App Shows Enabled Locations (Negative Test)
    // ============================================================================
    test('TC1.6: Client app should only show enabled locations', async ({ page }) => {
        // Navigate to client app
        await page.goto('http://localhost:3000');

        // Search for AC Repair
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('AC Repair');
        await page.keyboard.press('Enter');

        // Wait for results
        await page.waitForLoadState('networkidle');

        // Click on AC Repair service
        await page.click('text=AC');
        await page.waitForLoadState('networkidle');

        // Verify location dropdown only shows Gurugram and Navi Mumbai
        const locationSelect = page.locator('select[name="location"]');
        await expect(locationSelect).toBeVisible();

        // Get all options
        const options = await locationSelect.locator('option').allTextContents();

        // Should include Gurugram and Navi Mumbai
        expect(options).toContain('Gurugram');
        expect(options).toContain('Navi Mumbai');

        // Should NOT include disabled locations (e.g., Delhi, Bangalore)
        expect(options).not.toContain('Delhi');
        expect(options).not.toContain('Bangalore');
    });

    // ============================================================================
    // TC1.7: Admin Cannot Enable Service Without Production Mode (Negative)
    // ============================================================================
    test('TC1.7: Service enabled without production mode should not appear in client app', async ({ page }) => {
        // Login as admin
        await adminHelpers.login(page);

        // Navigate to location manager
        await page.click('a[href*="location"]');
        await page.waitForLoadState('networkidle');

        // Find a different service (e.g., Plumbing)
        const plumbingRow = page.locator('tr:has-text("Plumbing")').first();

        if (await plumbingRow.isVisible()) {
            // Enable for Gurugram but keep production mode OFF
            const gurugramToggle = plumbingRow.locator('[data-location="Gurugram"]');
            await gurugramToggle.check();

            const prodModeToggle = plumbingRow.locator('[data-production-mode="Gurugram"]');
            await prodModeToggle.uncheck();

            // Save
            await page.click('button:has-text("Save")');
            await expect(page.locator('text=saved')).toBeVisible({ timeout: 5000 });

            // Now check client app
            await page.goto('http://localhost:3000');

            // Search for Plumbing
            const searchInput = page.locator('input[placeholder*="Search"]');
            await searchInput.fill('Plumbing');
            await page.keyboard.press('Enter');

            // Plumbing should NOT appear in results (production mode is off)
            await expect(page.locator('text=Plumbing')).not.toBeVisible({ timeout: 3000 });
        }
    });
});
