/**
 * OTP Service with Test Mode Support
 * 
 * Provides OTP generation and verification with automatic bypass in test environments.
 * In test mode, uses a fixed OTP code '123456' for easy testing.
 */

export class OTPService {
    private static readonly TEST_OTP = '123456';
    private static readonly OTP_EXPIRY_MINUTES = 15;

    /**
     * Check if we're in test mode
     * Test mode is enabled when:
     * - ENABLE_OTP_BYPASS environment variable is 'true'
     * - NODE_ENV is 'test'
     */
    private static isTestMode(): boolean {
        return (
            import.meta.env.VITE_ENABLE_OTP_BYPASS === 'true' ||
            import.meta.env.MODE === 'test' ||
            import.meta.env.DEV === true // Enable in development by default
        );
    }

    /**
     * Send OTP to phone number
     * In test mode, logs OTP to console instead of sending SMS
     */
    static async sendOTP(phone: string): Promise<{ success: boolean; message?: string }> {
        if (this.isTestMode()) {
            console.log(`[TEST MODE] OTP for ${phone}: ${this.TEST_OTP}`);
            console.log('[TEST MODE] OTP bypass is enabled - use code: 123456');
            return {
                success: true,
                message: `Test OTP sent (use ${this.TEST_OTP})`
            };
        }

        // TODO: Implement real OTP sending via SMS gateway
        // For now, return error in production
        console.error('[OTP] Real OTP sending not implemented yet');
        return {
            success: false,
            message: 'OTP service not configured'
        };
    }

    /**
     * Verify OTP code
     * In test mode, accepts the fixed test OTP
     */
    static async verifyOTP(phone: string, otp: string): Promise<boolean> {
        if (this.isTestMode()) {
            const isValid = otp === this.TEST_OTP;
            console.log(`[TEST MODE] OTP verification for ${phone}: ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid;
        }

        // TODO: Implement real OTP verification
        // For now, return false in production
        console.error('[OTP] Real OTP verification not implemented yet');
        return false;
    }

    /**
     * Get test OTP code (only in test mode)
     */
    static getTestOTP(): string | null {
        return this.isTestMode() ? this.TEST_OTP : null;
    }
}
