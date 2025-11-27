import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('allows a new user to register and logs them in', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Click the login/register button to open the authentication modal
    await page.locator('text=Login').click();

    // Switch to the registration form
    // Assuming a button or link exists to switch from login to registration
    await page.locator('text=Don\'t have an account?').click();

    // Fill out the registration form with unique details
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('password123');

    // Submit the registration form
    await page.locator('button[type="submit"]').click();

    // After registration, the user should be logged in.
    // We can verify this by checking for the absence of the "Login" button
    // and the presence of a "Profile" or "Dashboard" link.
    await expect(page.locator('text=Login')).not.toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  test('allows an existing user to log in', async ({ page }) => {
    // This test assumes a user has already been created.
    // For a real-world scenario, we would either seed the database
    // or create a user via an API call in a setup step.
    await page.goto('http://localhost:5173/login'); // Assuming a direct login route

    // Fill out the login form
    await page.locator('input[name="email"]').fill('existing.user@example.com');
    await page.locator('input[name="password"]').fill('password123');

    // Submit the login form
    await page.locator('button[type="submit"]').click();

    // Assert that the user is logged in
    await expect(page.locator('text=Profile')).toBeVisible();
  });
});
