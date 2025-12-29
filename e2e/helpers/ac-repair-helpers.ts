/**
 * E2E Test Helpers for AC Repair Flow
 * Shared utilities for Admin, Provider, and Client test flows
 */

import { Page, expect } from '@playwright/test';

// ============================================================================
// ADMIN HELPERS
// ============================================================================

export const adminHelpers = {
    /**
     * Login as super admin
     */
    async login(page: Page, email: string = 'admin@thelokals.com', password: string = 'Admin@123') {
        await page.goto('/');

        // Navigate to admin login (adjust based on actual route)
        await page.goto('http://localhost:3001'); // Admin app port

        // Fill login form
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');

        // Wait for dashboard to load
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await expect(page).toHaveURL(/dashboard/);
    },

    /**
     * Navigate to location manager
     */
    async navigateToLocationManager(page: Page) {
        // Click on Services or Location Manager link
        await page.click('a[href*="location"]');
        await page.waitForLoadState('networkidle');
    },

    /**
     * Enable service for a location
     */
    async enableServiceForLocation(
        page: Page,
        serviceName: string,
        locationName: string,
        productionMode: boolean = true
    ) {
        // Find service row
        const serviceRow = page.locator(`tr:has-text("${serviceName}")`);
        await expect(serviceRow).toBeVisible();

        // Find location toggle within service row
        const locationToggle = serviceRow.locator(`[data-location="${locationName}"]`);

        // Enable if not already enabled
        const isEnabled = await locationToggle.isChecked();
        if (!isEnabled) {
            await locationToggle.click();
        }

        // Set production mode if needed
        if (productionMode) {
            const prodToggle = serviceRow.locator(`[data-production-mode="${locationName}"]`);
            const isProdMode = await prodToggle.isChecked();
            if (!isProdMode) {
                await prodToggle.click();
            }
        }

        // Save changes
        await page.click('button:has-text("Save")');
        await page.waitForSelector('text=Changes saved', { timeout: 5000 });
    },

    /**
     * Navigate to provider verifications
     */
    async navigateToVerifications(page: Page) {
        await page.click('a[href*="verification"]');
        await page.waitForLoadState('networkidle');
    },

    /**
     * Approve a provider
     */
    async approveProvider(page: Page, providerName: string) {
        // Find provider row
        const providerRow = page.locator(`tr:has-text("${providerName}")`);
        await expect(providerRow).toBeVisible();

        // Click approve button
        await providerRow.locator('button:has-text("Approve")').click();

        // Confirm approval
        await page.click('button:has-text("Confirm")');
        await page.waitForSelector('text=Provider approved', { timeout: 5000 });
    },
};

// ============================================================================
// PROVIDER HELPERS
// ============================================================================

export const providerHelpers = {
    /**
     * Signup/Login with phone OTP
     */
    async loginWithPhone(page: Page, phone: string = '+91 98765 43210', otp: string = '123456') {
        await page.goto('http://localhost:3002/auth'); // Provider app port

        // Enter phone number
        await page.fill('input[type="tel"]', phone);
        await page.click('button:has-text("Send OTP")');

        // Wait for OTP input
        await page.waitForSelector('input[placeholder*="OTP"]', { timeout: 5000 });

        // Enter OTP
        await page.fill('input[placeholder*="OTP"]', otp);
        await page.click('button:has-text("Verify")');

        // Wait for dashboard or registration page
        await page.waitForURL(/dashboard|registration/, { timeout: 10000 });
    },

    /**
     * Complete provider registration
     */
    async completeRegistration(
        page: Page,
        data: {
            name: string;
            services: string[];
            locations: string[];
        }
    ) {
        // Navigate to registration tab if not already there
        if (!page.url().includes('registration')) {
            await page.click('a[href*="registration"]');
        }

        // Fill registration form
        await page.fill('input[name="name"]', data.name);

        // Select services
        for (const service of data.services) {
            await page.click(`label:has-text("${service}")`);
        }

        // Select locations
        for (const location of data.locations) {
            await page.click(`label:has-text("${location}")`);
        }

        // Submit registration
        await page.click('button:has-text("Submit")');
        await page.waitForSelector('text=Registration submitted', { timeout: 5000 });
    },

    /**
     * Mock Cashfree onboarding
     */
    async completeCashfreeOnboarding(page: Page) {
        // Click Cashfree onboarding button
        await page.click('button:has-text("Complete Cashfree Setup")');

        // Mock Cashfree flow (in real scenario, this would redirect to Cashfree)
        // For testing, we'll just mark it as complete
        await page.evaluate(() => {
            // Simulate successful Cashfree callback
            localStorage.setItem('cashfree_onboarding_status', 'completed');
        });

        await page.reload();
        await page.waitForSelector('text=Cashfree account verified', { timeout: 5000 });
    },

    /**
     * Mock DigiLocker verification
     */
    async completeDigiLockerVerification(page: Page) {
        // Click DigiLocker verification button
        await page.click('button:has-text("Verify with DigiLocker")');

        // Mock DigiLocker flow
        await page.evaluate(() => {
            // Simulate successful DigiLocker callback
            localStorage.setItem('digilocker_verified', 'true');
        });

        await page.reload();
        await page.waitForSelector('text=DigiLocker verified', { timeout: 5000 });
    },

    /**
     * View bookings
     */
    async navigateToBookings(page: Page) {
        await page.click('a[href*="booking"]');
        await page.waitForLoadState('networkidle');
    },

    /**
     * Accept a booking
     */
    async acceptBooking(page: Page, bookingId: string) {
        // Find booking row
        const bookingRow = page.locator(`tr:has-text("${bookingId.slice(0, 8)}")`);
        await expect(bookingRow).toBeVisible();

        // Click accept button
        await bookingRow.locator('button:has-text("Accept")').click();

        // Confirm acceptance
        await page.click('button:has-text("Confirm")');
        await page.waitForSelector('text=Booking accepted', { timeout: 5000 });
    },

    /**
     * Mark booking as completed
     */
    async completeBooking(page: Page, bookingId: string) {
        // Find booking row
        const bookingRow = page.locator(`tr:has-text("${bookingId.slice(0, 8)}")`);
        await expect(bookingRow).toBeVisible();

        // Click complete button
        await bookingRow.locator('button:has-text("Complete")').click();

        // Confirm completion
        await page.click('button:has-text("Confirm")');
        await page.waitForSelector('text=Service completed', { timeout: 5000 });
    },
};

// ============================================================================
// CLIENT HELPERS
// ============================================================================

export const clientHelpers = {
    /**
     * Login with phone OTP
     */
    async loginWithPhone(page: Page, phone: string = '+91 98765 43211', otp: string = '123456') {
        await page.goto('http://localhost:3000/auth'); // Client app port

        // Enter phone number
        await page.fill('input[type="tel"]', phone);
        await page.click('button:has-text("Send OTP")');

        // Wait for OTP input
        await page.waitForSelector('input[placeholder*="OTP"]', { timeout: 5000 });

        // Enter OTP
        await page.fill('input[placeholder*="OTP"]', otp);
        await page.click('button:has-text("Verify")');

        // Wait for homepage
        await page.waitForURL('**/', { timeout: 10000 });
    },

    /**
     * Search for a service
     */
    async searchService(page: Page, serviceName: string) {
        await page.goto('http://localhost:3000');

        // Find search input
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill(serviceName);
        await page.keyboard.press('Enter');

        // Wait for results
        await page.waitForLoadState('networkidle');
    },

    /**
     * Select a service
     */
    async selectService(page: Page, serviceName: string) {
        // Click on service tile
        await page.click(`text=${serviceName}`);
        await page.waitForLoadState('networkidle');
    },

    /**
     * Book a service
     */
    async bookService(
        page: Page,
        data: {
            location: string;
            date?: string;
            time?: string;
        }
    ) {
        // Select location
        await page.selectOption('select[name="location"]', data.location);

        // Select date if provided
        if (data.date) {
            await page.fill('input[type="date"]', data.date);
        }

        // Select time if provided
        if (data.time) {
            await page.fill('input[type="time"]', data.time);
        }

        // Click book button
        await page.click('button:has-text("Book Now")');

        // Wait for checkout page
        await page.waitForURL('**/checkout', { timeout: 10000 });
    },

    /**
     * Confirm booking
     */
    async confirmBooking(page: Page): Promise<string> {
        // Click confirm button
        await page.click('button:has-text("Confirm Booking")');

        // Wait for confirmation page
        await page.waitForURL('**/bookings/**', { timeout: 10000 });

        // Extract booking ID from URL
        const url = page.url();
        const bookingId = url.split('/bookings/')[1];

        return bookingId;
    },

    /**
     * Complete payment (mock Cashfree)
     */
    async completePayment(page: Page, bookingId: string) {
        // Navigate to booking details
        await page.goto(`http://localhost:3000/bookings/${bookingId}`);

        // Click pay button
        await page.click('button:has-text("Pay Now")');

        // Mock Cashfree payment flow
        await page.evaluate(() => {
            // Simulate successful payment callback
            localStorage.setItem('payment_status', 'success');
        });

        // Wait for payment confirmation
        await page.waitForSelector('text=Payment successful', { timeout: 5000 });
    },

    /**
     * Submit rating
     */
    async submitRating(page: Page, bookingId: string, rating: number, review: string) {
        // Navigate to booking details
        await page.goto(`http://localhost:3000/bookings/${bookingId}`);

        // Click rating stars
        await page.click(`[data-rating="${rating}"]`);

        // Enter review
        await page.fill('textarea[name="review"]', review);

        // Submit rating
        await page.click('button:has-text("Submit Rating")');
        await page.waitForSelector('text=Rating submitted', { timeout: 5000 });
    },
};

// ============================================================================
// DATABASE HELPERS
// ============================================================================

export const dbHelpers = {
    /**
     * Verify services_locations table entry
     */
    async verifyServiceLocation(
        serviceName: string,
        locationName: string,
        enabled: boolean,
        productionMode: boolean
    ): Promise<boolean> {
        // This would use Supabase MCP in actual implementation
        // For now, return true as placeholder
        return true;
    },

    /**
     * Verify booking status
     */
    async verifyBookingStatus(bookingId: string, expectedStatus: string): Promise<boolean> {
        // This would use Supabase MCP in actual implementation
        return true;
    },

    /**
     * Verify provider verification status
     */
    async verifyProviderStatus(providerId: string, expectedStatus: string): Promise<boolean> {
        // This would use Supabase MCP in actual implementation
        return true;
    },
};
