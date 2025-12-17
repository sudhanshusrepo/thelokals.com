
import { test, expect } from '@playwright/test';

test('homepage has title and link to login', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "Service Marketplace".
  await expect(page).toHaveTitle(/Service Marketplace/);

  // Create a locator for the login link.
  const loginLink = page.locator('text=Login');

  // Expect the link to be visible.
  await expect(loginLink).toBeVisible();
});
