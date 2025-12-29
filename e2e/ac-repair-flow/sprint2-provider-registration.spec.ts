/**
 * Sprint 2: Provider Registration + Approval E2E Tests
 * Tests provider signup, Cashfree onboarding, DigiLocker verification, and admin approval
 */

import { test, expect } from '@playwright/test';
import { providerHelpers, adminHelpers } from '../helpers/ac-repair-helpers';

test.describe('Sprint 2: Provider Registration + Approval', () => {
    const TEST_PROVIDER_PHONE = '+91 98765 43210';
    const TEST_PROVIDER_NAME = 'Test AC Repair Provider';
    const TEST_OTP = '123456'; // Mock OTP for testing

    // ============================================================================
    // TC2.1: Provider Signup with Phone OTP
    // ============================================================================
    test('TC2.1: Provider can signup with phone OTP', async ({ page }) => {
        // Navigate to provider app
        await page.goto('http://localhost:3002/auth');

        // Enter phone number
        await page.fill('input[type="tel"]', TEST_PROVIDER_PHONE);
        await page.click('button:has-text("Send OTP")');

        // Wait for OTP input
        await expect(page.locator('input[placeholder*="OTP"]')).toBeVisible({ timeout: 5000 });

        // Enter OTP
        await page.fill('input[placeholder*="OTP"]', TEST_OTP);
        await page.click('button:has-text("Verify")');

        // Should redirect to dashboard or registration
        await page.waitForURL(/dashboard|registration/, { timeout: 10000 });

        // Verify user is authenticated
        await expect(page.locator('text=Welcome')).toBeVisible();
    });

    // ============================================================================
    // TC2.2: Provider Must Complete Registration (Mandatory)
    // ============================================================================
    test('TC2.2: Provider cannot access bookings without completing registration', async ({ page }) => {
        // Login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);

        // Try to navigate to bookings
        await page.goto('http://localhost:3002/bookings');

        // Should redirect to registration page
        await page.waitForURL(/registration/, { timeout: 5000 });

        // Verify registration required message
        await expect(page.locator('text=complete registration')).toBeVisible();
    });

    // ============================================================================
    // TC2.3: Provider Completes Registration Form
    // ============================================================================
    test('TC2.3: Provider can complete registration form', async ({ page }) => {
        // Login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);

        // Navigate to registration tab
        await page.click('a[href*="registration"]');

        // Fill registration form
        await page.fill('input[name="name"]', TEST_PROVIDER_NAME);

        // Select AC Repair service
        await page.click('label:has-text("AC Repair")');

        // Select Gurugram location
        await page.click('label:has-text("Gurugram")');

        // Submit registration
        await page.click('button:has-text("Submit")');

        // Verify submission success
        await expect(page.locator('text=Registration submitted')).toBeVisible({ timeout: 5000 });

        // Verify status is pending
        await expect(page.locator('text=Pending Approval')).toBeVisible();
    });

    // ============================================================================
    // TC2.4: Provider Completes Cashfree Onboarding (Mocked)
    // ============================================================================
    test('TC2.4: Provider can complete Cashfree merchant onboarding', async ({ page }) => {
        // Login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);

        // Navigate to registration tab
        await page.click('a[href*="registration"]');

        // Find Cashfree onboarding section
        await expect(page.locator('text=Cashfree Merchant Setup')).toBeVisible();

        // Click Cashfree onboarding button
        await page.click('button:has-text("Setup Cashfree Account")');

        // Mock Cashfree redirect and callback
        await page.evaluate(() => {
            // Simulate successful Cashfree merchant onboarding
            window.postMessage({
                type: 'CASHFREE_ONBOARDING_SUCCESS',
                merchantId: 'TEST_MERCHANT_123',
                status: 'completed'
            }, '*');
        });

        // Wait for success message
        await expect(page.locator('text=Cashfree account verified')).toBeVisible({ timeout: 5000 });

        // Verify merchant ID is saved
        const merchantIdDisplay = page.locator('[data-testid="merchant-id"]');
        await expect(merchantIdDisplay).toContainText('TEST_MERCHANT_123');
    });

    // ============================================================================
    // TC2.5: Provider Completes DigiLocker Verification (Mocked)
    // ============================================================================
    test('TC2.5: Provider can complete DigiLocker KYC verification', async ({ page }) => {
        // Login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);

        // Navigate to registration tab
        await page.click('a[href*="registration"]');

        // Find DigiLocker verification section
        await expect(page.locator('text=DigiLocker Verification')).toBeVisible();

        // Click DigiLocker verification button
        await page.click('button:has-text("Verify with DigiLocker")');

        // Mock DigiLocker redirect and callback
        await page.evaluate(() => {
            // Simulate successful DigiLocker verification
            window.postMessage({
                type: 'DIGILOCKER_VERIFICATION_SUCCESS',
                data: {
                    name: 'Test AC Repair Provider',
                    aadhaar: 'XXXX-XXXX-1234',
                    verified: true
                }
            }, '*');
        });

        // Wait for success message
        await expect(page.locator('text=DigiLocker verified')).toBeVisible({ timeout: 5000 });

        // Verify verification status
        await expect(page.locator('[data-testid="digilocker-status"]')).toContainText('Verified');
    });

    // ============================================================================
    // TC2.6: Admin Receives Provider Approval Request
    // ============================================================================
    test('TC2.6: Admin can see pending provider in verifications page', async ({ page }) => {
        // Login as admin
        await adminHelpers.login(page);

        // Navigate to verifications page
        await page.click('a[href*="verification"]');
        await page.waitForLoadState('networkidle');

        // Verify pending provider is visible
        const providerRow = page.locator(`tr:has-text("${TEST_PROVIDER_NAME}")`);
        await expect(providerRow).toBeVisible();

        // Verify status is pending
        await expect(providerRow.locator('text=Pending')).toBeVisible();

        // Verify Cashfree and DigiLocker status
        await expect(providerRow.locator('[data-cashfree-status="completed"]')).toBeVisible();
        await expect(providerRow.locator('[data-digilocker-status="verified"]')).toBeVisible();
    });

    // ============================================================================
    // TC2.7: Admin Approves Provider
    // ============================================================================
    test('TC2.7: Admin can approve provider', async ({ page }) => {
        // Login as admin
        await adminHelpers.login(page);

        // Navigate to verifications page
        await page.click('a[href*="verification"]');
        await page.waitForLoadState('networkidle');

        // Find provider row
        const providerRow = page.locator(`tr:has-text("${TEST_PROVIDER_NAME}")`);
        await expect(providerRow).toBeVisible();

        // Click approve button
        await providerRow.locator('button:has-text("Approve")').click();

        // Confirm approval in modal
        await page.click('button:has-text("Confirm")');

        // Wait for success message
        await expect(page.locator('text=Provider approved')).toBeVisible({ timeout: 5000 });

        // Verify status changed to approved
        await expect(providerRow.locator('text=Approved')).toBeVisible();
    });

    // ============================================================================
    // TC2.8: Provider Can Access Bookings After Approval
    // ============================================================================
    test('TC2.8: Approved provider can access bookings page', async ({ page }) => {
        // Login as provider
        await providerHelpers.loginWithPhone(page, TEST_PROVIDER_PHONE, TEST_OTP);

        // Navigate to bookings
        await page.goto('http://localhost:3002/bookings');

        // Should NOT redirect to registration
        await expect(page).toHaveURL(/bookings/);

        // Verify bookings page loaded
        await expect(page.locator('h1:has-text("Bookings")')).toBeVisible();

        // Verify provider can see booking list (even if empty)
        await expect(page.locator('[data-testid="bookings-list"]')).toBeVisible();
    });

    // ============================================================================
    // TC2.9: Unapproved Provider Cannot Accept Bookings (Negative)
    // ============================================================================
    test('TC2.9: Unapproved provider cannot accept bookings', async ({ page }) => {
        // Create a new provider (not approved)
        const unapprovedPhone = '+91 98765 43299';
        await providerHelpers.loginWithPhone(page, unapprovedPhone, TEST_OTP);

        // Complete registration but don't get admin approval
        await providerHelpers.completeRegistration(page, {
            name: 'Unapproved Provider',
            services: ['AC Repair'],
            locations: ['Gurugram']
        });

        // Try to access bookings
        await page.goto('http://localhost:3002/bookings');

        // Should show "pending approval" message
        await expect(page.locator('text=pending approval')).toBeVisible();

        // Booking list should be disabled or empty
        const bookingsList = page.locator('[data-testid="bookings-list"]');
        await expect(bookingsList).toHaveAttribute('data-disabled', 'true');
    });

    // ============================================================================
    // TC2.10: Verify Database State After Approval
    // ============================================================================
    test('TC2.10: Verify provider status in database after approval', async ({ page }) => {
        // Login as admin to get auth token
        await adminHelpers.login(page);

        // Query providers table via API
        const response = await page.request.get('http://localhost:54321/rest/v1/providers', {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
            },
            params: {
                'phone': `eq.${TEST_PROVIDER_PHONE}`
            }
        });

        expect(response.ok()).toBeTruthy();

        const providers = await response.json();
        expect(providers.length).toBeGreaterThan(0);

        const provider = providers[0];

        // Verify provider fields
        expect(provider.verification_status).toBe('approved');
        expect(provider.cashfree_account_verified).toBe(true);
        expect(provider.digilocker_verified).toBe(true);
        expect(provider.cashfree_merchant_id).toBeTruthy();
    });
});
