
import { test } from '@playwright/test';
import fs from 'fs';

test('Debug Home Page Content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    console.log(`URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}`);

    // Check if Hero is visible
    const hero = page.locator('img[alt="Hero"]');
    console.log(`Hero count: ${await hero.count()}`);
    if (await hero.count() > 0) {
        console.log(`Hero visible: ${await hero.isVisible()}`);
        console.log(`Hero src: ${await hero.getAttribute('src')}`);
        const naturalWidth = await hero.evaluate((img: HTMLImageElement) => img.naturalWidth);
        const complete = await hero.evaluate((img: HTMLImageElement) => img.complete);
        console.log(`Hero naturalWidth: ${naturalWidth}, complete: ${complete}`);
    } else {
        console.log('Hero img tag not found');
        console.log('HTML Dump: ', await page.content());
    }
});
