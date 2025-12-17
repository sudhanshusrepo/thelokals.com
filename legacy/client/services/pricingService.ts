import { supabase } from '@thelocals/core/services/supabase';

export interface DynamicPriceRequest {
    serviceCategory: string;
    serviceType: string;
    location: { lat: number; lng: number };
    requestedTime: string;
    providerId?: string;
}

export interface DynamicPriceResponse {
    success: boolean;
    price: number;
    breakdown: {
        base: number;
        timingMultiplier: number;
        locationMultiplier: number;
        demandMultiplier: number;
        aiAdjustment: number;
    };
    reasoning: string;
    currency: string;
    isFallback?: boolean;
    error?: string;
}

export const pricingService = {
    async getDynamicPrice(request: DynamicPriceRequest): Promise<DynamicPriceResponse> {
        // Test Mode Bypass
        const isTestMode = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_TEST_MODE === 'true' || import.meta.env.VITE_ENABLE_OTP_BYPASS === 'true'));

        if (isTestMode) {
            console.log('[Test Mode] Bypassing Pricing Edge Function');
            return {
                success: true,
                price: 500,
                breakdown: { base: 400, timingMultiplier: 1, locationMultiplier: 1, demandMultiplier: 1.1, aiAdjustment: 1.15 },
                reasoning: "Test mode estimate",
                currency: 'INR',
                isFallback: false
            };
        }

        try {
            const { data, error } = await supabase.functions.invoke('calculate-dynamic-price', {
                body: request,
            });

            if (error) {
                console.error('Pricing API error:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Failed to calculate price:', error);
            // Return a safe fallback structure if API fails completely
            return {
                success: false,
                price: 0, // UI should handle this
                breakdown: { base: 0, timingMultiplier: 1, locationMultiplier: 1, demandMultiplier: 1, aiAdjustment: 1 },
                reasoning: "Could not calculate dynamic price.",
                currency: 'INR',
                isFallback: true,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
};
