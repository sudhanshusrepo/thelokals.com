/**
 * Sprint 3: Client Booking → Provider Accept → Payment → Rating E2E Tests
 * Tests full booking lifecycle from client booking to payment and rating
 */

import { test, expect } from '@playwright/test';
import { clientHelpers, providerHelpers, adminHelpers } from '../helpers/ac-repair-helpers';

test.describe('Sprint 3: Client Booking → Payment → Rating', () => {
    const TEST_CLIENT_PHONE = '+91 98765 43211';
    const TEST_PROVIDER_PHONE = '+91 98765 43210';
    const TEST_OTP = '123456';

    let bookingId: string;

    // ============================================================================
    // TC3.1: Client Can Search for AC Repair
    // ============================================================================
    test('TC3.1: Client can search for AC Repair service', async ({ page }) => {
        // Navigate to client app
        await page.goto('http://localhost:3000');

        // Search for AC Repair
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('AC Repair');
        await page.keyboard.press('Enter');

        // Wait for results
        await page.waitForLoadState('networkidle');

        // Verify AC Repair service is visible
        await expect(page.locator('text=AC')).toBeVisible();
    });

    // ============================================================================
    // TC3.2: Client Can Select AC Repair Service
    // ============================================================================
    test('TC3.2: Client can select AC Repair and see enabled locations', async ({ page }) => {
        // Navigate to client app
        await page.goto('http://localhost:3000');

        // Search and select AC Repair
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');

        // Verify location dropdown shows only enabled locations
        const locationSelect = page.locator('select[name="location"]');
        await expect(locationSelect).toBeVisible();

        const options = await locationSelect.locator('option').allTextContents();

        // Should include Gurugram and Navi Mumbai (enabled in Sprint 1)
        expect(options).toContain('Gurugram');
        expect(options).toContain('Navi Mumbai');
    });

    // ============================================================================
    // TC3.3: Client Can Book AC Repair Service
    // ============================================================================
    test('TC3.3: Client can book AC Repair for Gurugram', async ({ page }) => {
        // Login as client
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);

        // Search and select AC Repair
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');

        // Book service
        await clientHelpers.bookService(page, {
            location: 'Gurugram',
            date: '2025-12-30',
            time: '14:00'
        });

        // Verify checkout page
        await expect(page).toHaveURL(/checkout/);

        // Confirm booking
        bookingId = await clientHelpers.confirmBooking(page);

        // Verify booking created
        expect(bookingId).toBeTruthy();
        await expect(page.locator('text=Booking confirmed')).toBeVisible();
    });

    // ============================================================================
    // TC3.4: Verify Booking Status is PENDING
    // ============================================================================
    test('TC3.4: New booking has PENDING status', async ({ page }) => {
        // Login as client
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);

        // Create booking
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');
        await clientHelpers.bookService(page, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(page);

        // Navigate to booking details
        await page.goto(`http://localhost:3000/bookings/${bookingId}`);

        // Verify status is PENDING
        await expect(page.locator('[data-status="PENDING"]')).toBeVisible();
        await expect(page.locator('text=Waiting for provider')).toBeVisible();
    });

    // ============================================================================
    // TC3.5: Provider Receives Booking Notification
    // ============================================================================
    test('TC3.5: Provider can see new booking in bookings list', async ({ page }) => {
        // First, create a booking as client
        const clientPage = await page.context().newPage();
        await clientHelpers.loginWithPhone(clientPage, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(clientPage, 'AC Repair');
        await clientHelpers.selectService(clientPage, 'AC Repair');
        await clientHelpers.bookService(clientPage, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(clientPage);
        await clientPage.close();

        // Now login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);

        // Navigate to bookings
        await providerHelpers.navigateToBookings(page);

        // Verify booking is visible
        const bookingRow = page.locator(`tr:has-text("${bookingId.slice(0, 8)}")`);
        await expect(bookingRow).toBeVisible();

        // Verify status is PENDING
        await expect(bookingRow.locator('text=PENDING')).toBeVisible();
    });

    // ============================================================================
    // TC3.6: Provider Can Accept Booking
    // ============================================================================
    test('TC3.6: Provider can accept booking', async ({ page }) => {
        // Setup: Create booking as client
        const clientPage = await page.context().newPage();
        await clientHelpers.loginWithPhone(clientPage, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(clientPage, 'AC Repair');
        await clientHelpers.selectService(clientPage, 'AC Repair');
        await clientHelpers.bookService(clientPage, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(clientPage);
        await clientPage.close();

        // Login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(page);

        // Accept booking
        await providerHelpers.acceptBooking(page, bookingId);

        // Verify success message
        await expect(page.locator('text=Booking accepted')).toBeVisible();

        // Verify status changed to ACCEPTED
        const bookingRow = page.locator(`tr:has-text("${bookingId.slice(0, 8)}")`);
        await expect(bookingRow.locator('text=ACCEPTED')).toBeVisible();
    });

    // ============================================================================
    // TC3.7: Verify Booking Status Transition (PENDING → ACCEPTED)
    // ============================================================================
    test('TC3.7: Booking status transitions correctly from PENDING to ACCEPTED', async ({ page }) => {
        // Create booking
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');
        await clientHelpers.bookService(page, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(page);

        // Verify initial status is PENDING
        await page.goto(`http://localhost:3000/bookings/${bookingId}`);
        await expect(page.locator('[data-status="PENDING"]')).toBeVisible();

        // Provider accepts booking
        const providerPage = await page.context().newPage();
        await providerHelpers.loginWithPhone(providerPage, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(providerPage);
        await providerHelpers.acceptBooking(providerPage, bookingId);
        await providerPage.close();

        // Refresh client page and verify status changed
        await page.reload();
        await expect(page.locator('[data-status="ACCEPTED"]')).toBeVisible();
        await expect(page.locator('text=Provider accepted')).toBeVisible();
    });

    // ============================================================================
    // TC3.8: Provider Can Mark Service as Completed
    // ============================================================================
    test('TC3.8: Provider can mark service as completed', async ({ page }) => {
        // Setup: Create and accept booking
        const clientPage = await page.context().newPage();
        await clientHelpers.loginWithPhone(clientPage, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(clientPage, 'AC Repair');
        await clientHelpers.selectService(clientPage, 'AC Repair');
        await clientHelpers.bookService(clientPage, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(clientPage);
        await clientPage.close();

        // Provider accepts and completes
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(page);
        await providerHelpers.acceptBooking(page, bookingId);

        // Mark as completed
        await providerHelpers.completeBooking(page, bookingId);

        // Verify success message
        await expect(page.locator('text=Service completed')).toBeVisible();

        // Verify status changed to COMPLETED
        const bookingRow = page.locator(`tr:has-text("${bookingId.slice(0, 8)}")`);
        await expect(bookingRow.locator('text=COMPLETED')).toBeVisible();
    });

    // ============================================================================
    // TC3.9: Client Can Complete Payment (Cashfree Sandbox)
    // ============================================================================
    test('TC3.9: Client can complete payment via Cashfree', async ({ page }) => {
        // Setup: Create, accept, and complete booking
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');
        await clientHelpers.bookService(page, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(page);

        // Provider accepts and completes (in background)
        const providerPage = await page.context().newPage();
        await providerHelpers.loginWithPhone(providerPage, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(providerPage);
        await providerHelpers.acceptBooking(providerPage, bookingId);
        await providerHelpers.completeBooking(providerPage, bookingId);
        await providerPage.close();

        // Client completes payment
        await clientHelpers.completePayment(page, bookingId);

        // Verify payment success
        await expect(page.locator('text=Payment successful')).toBeVisible();

        // Verify payment status updated
        await expect(page.locator('[data-payment-status="PAID"]')).toBeVisible();
    });

    // ============================================================================
    // TC3.10: Client Can Submit Rating
    // ============================================================================
    test('TC3.10: Client can submit rating and review', async ({ page }) => {
        // Setup: Complete full flow including payment
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');
        await clientHelpers.bookService(page, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(page);

        // Provider flow
        const providerPage = await page.context().newPage();
        await providerHelpers.loginWithPhone(providerPage, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(providerPage);
        await providerHelpers.acceptBooking(providerPage, bookingId);
        await providerHelpers.completeBooking(providerPage, bookingId);
        await providerPage.close();

        // Complete payment
        await clientHelpers.completePayment(page, bookingId);

        // Submit rating
        await clientHelpers.submitRating(page, bookingId, 5, 'Excellent AC repair service!');

        // Verify rating submitted
        await expect(page.locator('text=Rating submitted')).toBeVisible();

        // Verify rating displayed
        await expect(page.locator('[data-rating="5"]')).toBeVisible();
        await expect(page.locator('text=Excellent AC repair service!')).toBeVisible();
    });

    // ============================================================================
    // TC3.11: Verify Provider Rating Updated
    // ============================================================================
    test('TC3.11: Provider average rating updates after client rating', async ({ page }) => {
        // Complete full flow with rating
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');
        await clientHelpers.bookService(page, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(page);

        const providerPage = await page.context().newPage();
        await providerHelpers.loginWithPhone(providerPage, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(providerPage);
        await providerHelpers.acceptBooking(providerPage, bookingId);
        await providerHelpers.completeBooking(providerPage, bookingId);

        await clientHelpers.completePayment(page, bookingId);
        await clientHelpers.submitRating(page, bookingId, 5, 'Great service!');

        // Check provider profile
        await providerPage.goto('http://localhost:3002/profile');

        // Verify rating updated
        const ratingDisplay = providerPage.locator('[data-testid="average-rating"]');
        await expect(ratingDisplay).toContainText('5.0');

        await providerPage.close();
    });

    // ============================================================================
    // TC3.12: Invalid Status Transition Blocked (Negative Test)
    // ============================================================================
    test('TC3.12: Cannot skip booking status states', async ({ page }) => {
        // Create booking
        await clientHelpers.loginWithPhone(page, TEST_CLIENT_PHONE, TEST_OTP);
        await clientHelpers.searchService(page, 'AC Repair');
        await clientHelpers.selectService(page, 'AC Repair');
        await clientHelpers.bookService(page, { location: 'Gurugram' });
        bookingId = await clientHelpers.confirmBooking(page);

        // Try to mark as completed without accepting (should fail)
        const providerPage = await page.context().newPage();
        await providerHelpers.loginWithPhone(providerPage, TEST_PROVIDER_PHONE, TEST_OTP);
        await providerHelpers.navigateToBookings(providerPage);

        // Try to complete booking directly (should be disabled or error)
        const bookingRow = providerPage.locator(`tr:has-text("${bookingId.slice(0, 8)}")`);
        const completeButton = bookingRow.locator('button:has-text("Complete")');

        // Button should be disabled or not visible
        await expect(completeButton).toBeDisabled();

        await providerPage.close();
    });
});
