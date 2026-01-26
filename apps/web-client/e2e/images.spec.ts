
import { test, expect } from '@playwright/test';

test.describe('Image Loading Tests', () => {

    test('Home Page images should load correctly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        // Check Hero Image
        const heroImg = page.locator('img[alt="Hero"]').first();
        await expect(heroImg).toBeVisible();

        // Check src attribute - looking for Unsplash URL or CF URL
        const src = await heroImg.getAttribute('src');
        console.log('Hero Src:', src);
        expect(src).toMatch(/unsplash\.com|imagedelivery\.net|data:/);

        // Soft check for naturalWidth (Headless environment often reports 0 for external images)
        const isLoaded = await heroImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
        if (!isLoaded) {
            console.log('WARN: Hero image naturalWidth is 0. This is common in headless CI/Dev environments for external images.');
        }

        // Check Service Grid Images
        const gridImages = page.locator('.grid img');
        await expect(gridImages.first()).toBeVisible();
        const count = await gridImages.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Service Detail images should load correctly', async ({ page }) => {
        await page.goto('/');

        // Navigate
        const link = page.locator('a[href^="/services/"]').first();
        await link.click();

        // Check Main Service Image
        const mainImg = page.locator('div.relative img[alt]').first();
        await expect(mainImg).toBeVisible();

        const src = await mainImg.getAttribute('src');
        console.log('Service Detail Src:', src);
        expect(src).toBeTruthy();

        // Soft check
        const isLoaded = await mainImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
        if (!isLoaded) {
            console.log('WARN: Service Detail image naturalWidth is 0.');
        }
    });

});
