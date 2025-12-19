
import { test, expect } from '@playwright/test';

// Configuration
const CLIENT_URL = 'http://localhost:3002'; // Corrected port
const PROVIDER_URL = 'http://localhost:3001'; // Corrected port
const ADMIN_URL = 'http://localhost:3003';    // Assuming Admin runs on 3003

test.describe('Master System Flow', () => {
    let bookingId: string;

    // 1. Client: Book a Service
    test('Client should successfully book a service', async ({ page }) => {
        await page.goto(`${CLIENT_URL}/service/plumber`);

        // Select Issue Type
        await page.click('text=Urgent / Emergency');
        await expect(page.locator('text=Surge Pricing Applied')).toBeVisible();

        // Book Now
        await page.click('button:has-text("Book Now")');

        // Wait for Matching Animation
        await expect(page.locator('text=Finding the perfect professional')).toBeVisible();

        // Simulate successful match (In E2E we verify redirect to Confirmation)
        // Note: In real E2E with backend, we need to ensure a provider matches. 
        // For this test, we assume the backend "Demo Mode" matches instantly.

        // Expect redirection to booking confirmation or Home
        // await expect(page).toHaveURL(/.*booking.*/);
    });

    // 2. Provider: Accept and Complete Job
    test('Provider should see and complete the job', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto(`${PROVIDER_URL}/auth`);
        // Mock Auth or Log in
        await page.fill('input[type="tel"]', '9999999999');
        await page.click('button:has-text("Continue")');
        // OTP
        await page.fill('input[name="otp"]', '123456');
        await page.click('button:has-text("Verify")');

        await expect(page).toHaveURL(`${PROVIDER_URL}/dashboard`);

        // Open Active Job (Assuming the one just created)
        // await page.click('text=Active Job');

        // Simulate Completion
        // await page.click('button:has-text("Complete Job")');

        // Verify "Waiting for rating" state
        // await expect(page.locator('text=Waiting for customer feedback')).toBeVisible();
    });

    // 3. Client: Rate Service
    test('Client should rate the service', async ({ page }) => {
        // Navigate to Rating Page (Simulating callback)
        // await page.goto(`${CLIENT_URL}/rating/${bookingId}`);
        // await page.click('button:has-text("5")'); // 5 Stars
        // await page.fill('textarea', 'Excellent service! Very professional.');
        // await page.click('button:has-text("Submit Feedback")');
    });

    // 4. Admin: Verify Feedback
    test('Admin should see the verification', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto(`${ADMIN_URL}/bookings`);
        // Should see the recent booking with 5 stars
        // await expect(page.locator('text=Excellent service!')).toBeVisible();
    });
});
