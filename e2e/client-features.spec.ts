import { test, expect } from '@playwright/test';

test.describe('Client UI/UX Features', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Supabase response for service categories to ensure deterministic tests
        await page.route('**/rest/v1/service_categories*', async route => {
            const json = [
                {
                    id: 'ac-repair',
                    name: 'AC & Appliances',
                    description: 'AC repair • RO service • Fridge repair',
                    image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600',
                    gradient_colors: 'from-blue-500/80 to-cyan-500/80',
                    display_order: 1,
                    is_active: true
                },
                {
                    id: 'legal-consult',
                    name: 'Legal Consultation',
                    description: 'Video calls with top lawyers.',
                    image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600',
                    gradient_colors: 'from-slate-700/80 to-slate-900/80',
                    display_order: 2,
                    is_active: true
                }
            ];
            await route.fulfill({ json });
        });

        await page.goto('/');
    });

    test('Hero Section: Visibility checks', async ({ page, isMobile }) => {
        // Search bar should always be visible
        await expect(page.getByPlaceholder('Search for a service or issue...')).toBeVisible();

        // Headline "Trusted Local Services" should be hidden on mobile, visible on desktop
        const headline = page.getByRole('heading', { name: /Trusted Local Services/i });

        if (isMobile) {
            await expect(headline).toBeHidden();
        } else {
            await expect(headline).toBeVisible();
        }
    });

    test('Hero Section: Input interactions', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search for a service or issue...');
        await searchInput.click();
        await searchInput.fill('Plumber');
        await expect(searchInput).toHaveValue('Plumber');

        // Mic icon check (existence)
        const micButton = page.locator('button:has(svg path[d*="M19 11a7 7"])');
        await expect(micButton).toBeVisible();
    });

    test('Browse Services: Toggle functionality', async ({ page }) => {
        // Scroll to Browse Services to ensure it's in view
        const browseSection = page.locator('section:has-text("Browse Services")');
        await browseSection.scrollIntoViewIfNeeded();

        const onlineBtn = page.getByRole('button', { name: 'Online' });
        const offlineBtn = page.getByRole('button', { name: 'In-Person' });

        await expect(onlineBtn).toBeVisible();
        await expect(offlineBtn).toBeVisible();

        // Default should be Offline (In-Person)
        // Active has 'bg-white text-slate-900'
        await expect(offlineBtn).toHaveClass(/bg-white/);

        // Click Online
        await onlineBtn.click();
        await expect(onlineBtn).toHaveClass(/bg-white/);
        await expect(offlineBtn).not.toHaveClass(/bg-white/);

        // Verify content change provided data exists
        const legalCard = page.getByText('Legal Consultation');
        await expect(legalCard).toBeVisible();

        // Check badge text if visible
        const videoBadge = page.locator('text=Video Call');
        await expect(videoBadge).toBeVisible();

        // Click Offline to go back
        await offlineBtn.click();
        // 'AC & Appliances' is offline
        const acCard = page.getByRole('heading', { name: 'AC & Appliances' });
        await expect(acCard).toBeVisible();
    });

    test('Footer & Navigation: Layout checks', async ({ page, isMobile }) => {
        // Footer should be visible at bottom
        const footer = page.locator('footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();

        // Check for merged Support/Legal columns
        await expect(footer.getByRole('heading', { name: 'Support' })).toBeVisible();
        await expect(footer.getByRole('heading', { name: 'Legal' })).toBeVisible();

        const bottomNav = page.getByRole('navigation', { name: 'Main navigation' });

        if (isMobile) {
            await expect(bottomNav).toBeVisible();
        }
    });

});
