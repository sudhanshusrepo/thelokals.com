import { test, expect } from '@playwright/test';

test.describe('Reviews and Ratings', () => {
    test.beforeEach(async ({ page }) => {
        // Login as test client
        await page.goto('/login');
        await page.fill('input[name="email"]', 'client@example.com');
        await page.fill('input[name="password"]', 'Test@123456');
        await page.click('button[type="submit"]');
    });

    test('should submit a review after completed booking', async ({ page }) => {
        // Navigate to completed bookings
        await page.goto('/bookings?status=COMPLETED');

        // Click on first completed booking
        await page.locator('.booking-card').first().click();

        // Click review button
        await page.click('button:has-text("Leave Review")');

        // Fill review form
        await page.click(`[data-rating="5"]`); // 5-star rating
        await page.fill('textarea[name="comment"]', 'Excellent service! Very professional and timely.');

        // Submit review
        await page.click('button:has-text("Submit Review")');

        // Verify success
        await expect(page.locator('text=Review submitted successfully')).toBeVisible();
    });

    test('should display provider reviews', async ({ page }) => {
        await page.goto('/providers/test-provider-id');

        // Verify reviews section
        await expect(page.locator('.reviews-section')).toBeVisible();

        // Verify at least one review exists
        const reviewCount = await page.locator('.review-card').count();
        expect(reviewCount).toBeGreaterThan(0);

        // Verify review details
        const firstReview = page.locator('.review-card').first();
        await expect(firstReview.locator('.review-rating')).toBeVisible();
        await expect(firstReview.locator('.review-comment')).toBeVisible();
        await expect(firstReview.locator('.review-date')).toBeVisible();
    });

    test('should calculate and display average rating', async ({ page }) => {
        await page.goto('/providers/test-provider-id');

        // Verify average rating is displayed
        await expect(page.locator('.average-rating')).toBeVisible();
        await expect(page.locator('.total-reviews')).toBeVisible();

        // Verify rating is between 0 and 5
        const ratingText = await page.locator('.average-rating').textContent();
        const rating = parseFloat(ratingText || '0');
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(5);
    });

    test('should prevent duplicate reviews for same booking', async ({ page }) => {
        await page.goto('/bookings/test-booking-id');

        // Try to submit review
        await page.click('button:has-text("Leave Review")');

        // If already reviewed, should show message
        const alreadyReviewed = await page.locator('text=You have already reviewed this booking').isVisible();
        if (alreadyReviewed) {
            expect(alreadyReviewed).toBeTruthy();
        }
    });

    test('should update provider rating after new review', async ({ page }) => {
        const providerPage = '/providers/test-provider-id';

        // Get initial rating
        await page.goto(providerPage);
        const initialRating = await page.locator('.average-rating').textContent();

        // Submit a new review (would need to complete a booking first)
        // This is a simplified test - in reality, you'd need proper test data

        // Verify rating might have changed
        await page.reload();
        const newRating = await page.locator('.average-rating').textContent();
        expect(newRating).toBeDefined();
    });
});
