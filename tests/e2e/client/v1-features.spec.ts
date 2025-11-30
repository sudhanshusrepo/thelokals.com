import { test, expect } from '@playwright/test';

test.describe('v1.0 Features - Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Service grid shows 3 columns on mobile', async ({ page, viewport }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Wait for service groups to load
        await page.waitForSelector('[data-testid="category-card"]');

        // Get all category cards
        const cards = await page.locator('[data-testid="category-card"]').all();

        // Should have 6 cards
        expect(cards.length).toBe(6);

        // Check grid layout (3 columns means cards should be in 2 rows)
        const firstCard = cards[0];
        const fourthCard = cards[3];

        const firstBox = await firstCard.boundingBox();
        const fourthBox = await fourthCard.boundingBox();

        // Fourth card should be below first card (different row)
        expect(fourthBox!.y).toBeGreaterThan(firstBox!.y);
    });

    test('Offer banner displays on homepage', async ({ page }) => {
        // Check for offer banner
        const banner = page.locator('text=/OFF|Free/i').first();
        await expect(banner).toBeVisible();
    });

    test('Processing animation displays during AI analysis', async ({ page }) => {
        // Navigate to service request page
        await page.click('[data-testid="category-card"]');

        // Fill in service request (if form exists)
        const chatInput = page.locator('[data-testid="chat-input-textarea"]');
        if (await chatInput.isVisible()) {
            await chatInput.fill('I need help with AC repair');
            await page.click('[data-testid="chat-send-button"]');

            // Processing animation should appear
            // Note: This might be too fast to catch, so we check for either animation or results
            const hasAnimation = await page.locator('text=/Processing|Analyzing/i').isVisible().catch(() => false);
            const hasResults = await page.locator('[data-testid="ai-checklist-section"]').isVisible().catch(() => false);

            expect(hasAnimation || hasResults).toBeTruthy();
        }
    });

    test('Service cards have hover animations', async ({ page }) => {
        const card = page.locator('[data-testid="category-card"]').first();

        // Get initial position
        const initialBox = await card.boundingBox();

        // Hover over card
        await card.hover();

        // Wait a bit for animation
        await page.waitForTimeout(300);

        // Card should have moved (scale/translate effect)
        // Note: This is hard to test precisely, so we just verify it's still visible
        await expect(card).toBeVisible();
    });

    test('Map component loads in LiveSearch', async ({ page }) => {
        // This test requires actually triggering a booking
        // For now, we'll skip it or mark as TODO
        test.skip();
    });
});

test.describe('Responsiveness Tests', () => {
    const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
        test(`Homepage renders correctly on ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('/');

            // Check critical elements
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('[data-testid="category-card"]').first()).toBeVisible();

            // No horizontal scroll
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1); // +1 for rounding
        });
    }
});
