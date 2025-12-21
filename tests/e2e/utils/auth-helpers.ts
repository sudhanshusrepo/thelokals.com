import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * Login as client using phone OTP (test mode with 123456)
 */
export async function loginAsClient(page: Page, phone: string) {
    // Navigate to auth page
    await page.goto('http://localhost:3000/auth');

    // Enter phone number (remove +91 prefix if present)
    const phoneNumber = phone.replace('+91', '');
    await page.getByPlaceholder('98765 43210').fill(phoneNumber);
    await page.getByRole('button', { name: 'Send OTP' }).click();

    // Enter test OTP
    await page.getByPlaceholder('123456').fill('123456');
    await page.getByRole('button', { name: 'Verify & Login' }).click();

    // Wait for redirect
    await page.waitForURL('http://localhost:3000/**', { timeout: 10000 });
}

/**
 * Login as provider using phone OTP (test mode with 123456)
 */
export async function loginAsProvider(page: Page, phone: string) {
    // Navigate to provider auth page
    await page.goto('http://localhost:3001/auth');

    // Enter phone number (remove +91 prefix if present)
    const phoneNumber = phone.replace('+91', '');
    await page.getByPlaceholder('+91 98765 43210').fill(phoneNumber);
    await page.getByRole('button', { name: 'Send OTP' }).click();

    // Enter test OTP
    await page.getByPlaceholder('123456').fill('123456');
    await page.getByRole('button', { name: 'Verify & Login' }).click();

    // Wait for redirect to dashboard
    await page.waitForURL('http://localhost:3001/**', { timeout: 10000 });
}

/**
 * Create a test user with admin client
 */
export async function createTestUser(email: string, password: string, phone?: string) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        phone,
        phone_confirm: !!phone
    });

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data.user;
}

/**
 * Delete a test user
 */
export async function deleteTestUser(userId: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) console.warn(`Failed to delete user ${userId}:`, error.message);
}

/**
 * Bypass OTP for test mode
 * Sets environment variable to enable test mode
 */
export function enableTestMode() {
    process.env.NEXT_PUBLIC_TEST_MODE = 'true';
    process.env.NEXT_PUBLIC_ENABLE_OTP_BYPASS = 'true';
}
