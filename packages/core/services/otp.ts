import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import { CONFIG } from '../config';

export interface OTPConfirmation {
    confirm: (code: string) => Promise<{ session: Session | null; user: any }>;
}

/**
 * OTP Service with Test Mode Support
 * 
 * Provides OTP generation and verification with automatic bypass in test environments.
 * Uses Supabase Native Auth (replacing Firebase).
 */
export class OTPService {
    private static readonly TEST_OTP = '123456';

    /**
     * Check if we're in test mode
     */
    public static isTestMode(): boolean {
        return (
            CONFIG.ENABLE_OTP_BYPASS ||
            CONFIG.IS_TEST_MODE ||
            CONFIG.IS_DEV
        );
    }

    public static getTestOTP(): string | null {
        return this.isTestMode() ? this.TEST_OTP : null;
    }

    /**
     * Send OTP to phone number using Supabase Auth
     * @param phone - Phone number
     * @param _appVerifier - Ignored (Legacy Firebase arg)
     */
    static async sendOTP(phone: string, _appVerifier?: any): Promise<OTPConfirmation> {
        if (this.isTestMode()) {

            return {
                confirm: async (code: string) => {
                    if (code === this.TEST_OTP) {
                        console.log(`[OTPService] Test Mode Confirmation for ${phone}`);

                        // HACK: For E2E tests, we map the test phone to a test email account
                        // so we can get a REAL Supabase Session via Password login.
                        // This allows RLS and Row-Level security to work properly in tests.
                        if (phone === '+919999999999') {
                            const { data, error } = await supabase.auth.signInWithPassword({
                                email: 'provider_test@example.com',
                                password: 'password'
                            });
                            if (error) throw error;
                            return { session: data.session, user: data.user };
                        }

                        // Fallback for other test numbers (Mock Session - might break RLS)
                        console.warn('Returning mock session for Test OTP (RLS might fail)');
                        return { session: null, user: { id: 'test-user', phone } };
                    }
                    throw new Error('Invalid OTP code');
                }
            };
        }

        // Real Supabase Auth Flow
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
                shouldCreateUser: true
            }
        });

        if (error) throw error;

        return {
            confirm: async (code: string) => {
                const { data, error } = await supabase.auth.verifyOtp({
                    phone,
                    token: code,
                    type: 'sms'
                });

                if (error) throw error;
                return { session: data.session, user: data.user };
            }
        };
    }
}
