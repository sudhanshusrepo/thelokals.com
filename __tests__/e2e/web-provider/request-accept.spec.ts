import { test, expect } from '@playwright/test';

test.describe('Provider - Request Accept Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login as provider
        await page.goto('/provider/login');
        await page.fill('input[name="phone"]', '+919876543210');
        await page.fill('input[name="otp"]', '123456');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/provider/dashboard');
    });

    test('Provider accepts request → Client sees real-time update', async ({ page, context }) => {
        // Provider dashboard shows incoming request
        await expect(page.locator('[data-testid="incoming-request"]').first()).toBeVisible();

        // View request details
        await page.click('[data-testid="view-request"]');

        // Request details visible
        await expect(page.locator('text=Plumbing Medium')).toBeVisible();
        await expect(page.locator('text=₹550')).toBeVisible();
        await expect(page.locator('text=Narnaund')).toBeVisible();

        // Accept request
        await page.click('button:has-text("ACCEPT REQUEST")');

        // Confirmation
        await expect(page.locator('text=Request Accepted')).toBeVisible();

        // Navigate to customer button visible
        await expect(page.locator('button:has-text("Navigate to Customer")')).toBeVisible();

        // Open client app to verify
        const clientPage = await context.newPage();
        await clientPage.goto('http://localhost:3000/live-request/req_123');

        // Client should see provider accepted
        await expect(clientPage.locator('text=Provider Accepted')).toBeVisible();
        await expect(clientPage.locator('text=Neeraj Kumar')).toBeVisible();
    });

    test('Provider navigates to customer location', async ({ page }) => {
        // Accept a request first
        await page.click('[data-testid="view-request"]');
        await page.click('button:has-text("ACCEPT REQUEST")');

        // Click navigate
        await page.click('button:has-text("Navigate to Customer")');

        // Map should open with route
        await expect(page.locator('[data-testid="navigation-map"]')).toBeVisible();

        // ETA displayed
        await expect(page.locator('[data-testid="eta-display"]')).toBeVisible();

        // Arrived button visible
        await expect(page.locator('button:has-text("I Have Arrived")')).toBeVisible();
    });

    test('Provider marks arrival and verifies OTP', async ({ page }) => {
        // Navigate to customer
        await page.click('[data-testid="view-request"]');
        await page.click('button:has-text("ACCEPT REQUEST")');
        await page.click('button:has-text("Navigate to Customer")');

        // Mark as arrived
        await page.click('button:has-text("I Have Arrived")');

        // OTP verification screen
        await expect(page.locator('text=Verify OTP')).toBeVisible();

        // Enter OTP
        await page.fill('#otp-input', '483920');
        await page.click('button:has-text("Verify")');

        // Service started
        await expect(page.locator('text=Service In Progress')).toBeVisible();
    });

    test('Provider marks service complete', async ({ page }) => {
        // Complete OTP verification first
        await page.click('[data-testid="view-request"]');
        await page.click('button:has-text("ACCEPT REQUEST")');
        await page.click('button:has-text("I Have Arrived")');
        await page.fill('#otp-input', '483920');
        await page.click('button:has-text("Verify")');

        // Service in progress
        await expect(page.locator('text=Service In Progress')).toBeVisible();

        // Add completion notes
        await page.fill('#completion-notes', 'Fixed the leaking pipe. Replaced washer.');

        // Mark complete
        await page.click('button:has-text("Mark Complete")');

        // Confirmation
        await expect(page.locator('text=Service Completed Successfully')).toBeVisible();

        // Payment pending status
        await expect(page.locator('text=Payment Pending')).toBeVisible();
    });

    test('Provider views earnings dashboard', async ({ page }) => {
        await page.goto('/provider/earnings');

        // Earnings summary
        await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
        await expect(page.locator('[data-testid="pending-payments"]')).toBeVisible();

        // Transaction history
        await expect(page.locator('[data-testid="transaction-item"]').first()).toBeVisible();

        // Filter by date
        await page.selectOption('#date-filter', 'this-week');

        // Filtered results
        await expect(page.locator('[data-testid="filtered-earnings"]')).toBeVisible();
    });

    test('Provider updates availability status', async ({ page }) => {
        await page.goto('/provider/dashboard');

        // Toggle availability
        await page.click('[data-testid="availability-toggle"]');

        // Confirmation dialog
        await page.click('button:has-text("Confirm")');

        // Status updated
        await expect(page.locator('text=Status: Offline')).toBeVisible();

        // No new requests should appear
        await expect(page.locator('[data-testid="incoming-request"]')).not.toBeVisible();
    });
});

test.describe('Provider - Profile Management', () => {
    test('Provider updates profile information', async ({ page }) => {
        await page.goto('/provider/login');
        await page.fill('input[name="phone"]', '+919876543210');
        await page.fill('input[name="otp"]', '123456');
        await page.click('button[type="submit"]');

        await page.goto('/provider/profile');

        // Update name
        await page.fill('#provider-name', 'Neeraj Kumar Singh');

        // Update services
        await page.check('#service-electrician');

        // Upload photo
        await page.setInputFiles('#profile-photo', 'test-assets/provider-photo.jpg');

        // Save changes
        await page.click('button:has-text("Save Changes")');

        await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });

    test('Provider views ratings and reviews', async ({ page }) => {
        await page.goto('/provider/login');
        await page.fill('input[name="phone"]', '+919876543210');
        await page.fill('input[name="otp"]', '123456');
        await page.click('button[type="submit"]');

        await page.goto('/provider/reviews');

        // Average rating displayed
        await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();

        // Individual reviews
        await expect(page.locator('[data-testid="review-item"]').first()).toBeVisible();

        // Filter by rating
        await page.selectOption('#rating-filter', '5');

        // Only 5-star reviews
        await expect(page.locator('text=⭐⭐⭐⭐⭐').first()).toBeVisible();
    });
});
