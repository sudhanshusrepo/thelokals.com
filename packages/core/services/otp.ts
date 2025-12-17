import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

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
    private static isTestMode(): boolean {
        return (
            import.meta.env.VITE_ENABLE_OTP_BYPASS === 'true' ||
            import.meta.env.MODE === 'test' ||
            import.meta.env.DEV === true // Enable in development by default
        );
    }

    /**
     * Send OTP to phone number using Supabase Auth
     * @param phone - Phone number
     * @param _appVerifier - Ignored (Legacy Firebase arg)
     */
    static async sendOTP(phone: string, _appVerifier?: any): Promise<OTPConfirmation> {
        if (this.isTestMode()) {
            console.log(`[TEST MODE] OTP for ${phone}: ${this.TEST_OTP}`);
            return {
                confirm: async (code: string) => {
                    if (code === this.TEST_OTP) {
                        // In test mode, we might not get a real session without a real existing user.
                        // For fully offline dev, this mock needs to be handled by the caller or we rely on the bridge still?
                        // Actually, if we use Supabase Auth, we can't easily fake a session LOCALLY without the emulator verifying a token.
                        // However, since we are moving to Supabase Native, 'isTestMode' is essentially 'mock behavior'.
                        // For now, let's throw if we expect real sessions, or return a mock structure.

                        // NOTE: If using Local Supabase, we can just use the real flow!
                        // "Test Mode" here was for bypassing Firebase limits. 
                        // With Local Supabase, we don't need to bypass, we can just use the Inbucket OTP.
                        // But to keep '123456' working without checking Inbucket:
                        console.warn('Returning mock session for Test OTP');
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
