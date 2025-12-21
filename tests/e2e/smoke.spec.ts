import { test, expect } from '@playwright/test';

test.describe('E2E Environment Smoke Test', () => {
    test('Web Client should be reachable', async ({ page }) => {
        // client is typically on 3000
        await page.goto('http://localhost:3000');
        const title = await page.title();
        console.log('Client Title:', title);
        expect(title).not.toBeNull();
    });

    test('Web Provider should be reachable', async ({ page }) => {
        // provider is typically on 3001
        await page.goto('http://localhost:3001');
        const title = await page.title();
        console.log('Provider Title:', title);
        expect(title).not.toBeNull();
    });
});
