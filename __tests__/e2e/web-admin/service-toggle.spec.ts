import { test, expect } from '@playwright/test';

test.describe('Admin - Service Toggle Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'admin@thelokals.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/admin/dashboard');
    });

    test('Admin pauses service → Client sees service unavailable', async ({ page, context }) => {
        // Admin: Navigate to location management
        await page.goto('/admin/locations/narnaund');

        // Pause plumber service
        await page.selectOption('#service-plumber-status', 'paused');
        await page.click('[data-testid="save-toggle"]');

        // Success message
        await expect(page.locator('text=Service status updated')).toBeVisible();

        // Open client app in new page
        const clientPage = await context.newPage();
        await clientPage.goto('http://localhost:3000');

        // Try to select plumber
        await clientPage.click('[data-testid="service-plumber"]');

        // Should show service paused message
        await expect(clientPage.locator('text=Plumbing service is currently paused')).toBeVisible();

        // Cleanup: Re-enable service
        await page.selectOption('#service-plumber-status', 'active');
        await page.click('[data-testid="save-toggle"]');
    });

    test('Admin enables new service in location', async ({ page }) => {
        await page.goto('/admin/locations/delhi');

        // Enable AC Repair (previously disabled)
        await page.check('#service-ac-repair-enabled');
        await page.click('[data-testid="save-toggle"]');

        await expect(page.locator('text=Service enabled successfully')).toBeVisible();

        // Verify in service list
        await expect(page.locator('#service-ac-repair-status')).toHaveValue('active');
    });

    test('Admin views real-time request dashboard', async ({ page }) => {
        await page.goto('/admin/dashboard/live-requests');

        // Should show active requests
        await expect(page.locator('[data-testid="live-request-card"]').first()).toBeVisible();

        // Filter by service type
        await page.selectOption('#filter-service', 'plumber');

        // Only plumber requests visible
        await expect(page.locator('text=Plumbing').first()).toBeVisible();

        // Filter by status
        await page.selectOption('#filter-status', 'broadcasting');

        // Only broadcasting requests
        await expect(page.locator('text=Broadcasting').first()).toBeVisible();
    });

    test('Admin manages provider approvals', async ({ page }) => {
        await page.goto('/admin/providers/pending');

        // Should show pending providers
        await expect(page.locator('[data-testid="provider-pending"]').first()).toBeVisible();

        // Approve first provider
        await page.click('[data-testid="approve-provider"]');

        // Confirmation dialog
        await page.click('button:has-text("Confirm Approval")');

        // Success message
        await expect(page.locator('text=Provider approved')).toBeVisible();

        // Provider moved to approved list
        await page.goto('/admin/providers/approved');
        await expect(page.locator('[data-testid="provider-approved"]').first()).toBeVisible();
    });

    test('Admin views analytics dashboard', async ({ page }) => {
        await page.goto('/admin/analytics');

        // Key metrics visible
        await expect(page.locator('[data-testid="metric-total-requests"]')).toBeVisible();
        await expect(page.locator('[data-testid="metric-active-providers"]')).toBeVisible();
        await expect(page.locator('[data-testid="metric-completion-rate"]')).toBeVisible();

        // Charts loaded
        await expect(page.locator('[data-testid="chart-requests-over-time"]')).toBeVisible();
        await expect(page.locator('[data-testid="chart-service-distribution"]')).toBeVisible();
    });
});

test.describe('Admin - Location Management', () => {
    test('Admin adds new city', async ({ page }) => {
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'admin@thelokals.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        await page.goto('/admin/locations');

        // Add new city
        await page.click('button:has-text("Add City")');

        await page.fill('#city-name', 'Rohtak');
        await page.fill('#city-state', 'Haryana');
        await page.fill('#city-latitude', '28.8955');
        await page.fill('#city-longitude', '76.6066');

        // Select available services
        await page.check('#service-plumber');
        await page.check('#service-electrician');

        await page.click('button:has-text("Save City")');

        // Success message
        await expect(page.locator('text=City added successfully')).toBeVisible();

        // Verify in city list
        await expect(page.locator('text=Rohtak, Haryana')).toBeVisible();
    });

    test('Admin updates service pricing for location', async ({ page }) => {
        await page.goto('/admin/login');
        await page.fill('input[name="email"]', 'admin@thelokals.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        await page.goto('/admin/locations/narnaund/pricing');

        // Update plumber pricing
        await page.fill('#plumber-basic-price', '400');
        await page.fill('#plumber-med-price', '600');
        await page.fill('#plumber-full-price', '900');

        await page.click('button:has-text("Update Pricing")');

        await expect(page.locator('text=Pricing updated')).toBeVisible();
    });
});
