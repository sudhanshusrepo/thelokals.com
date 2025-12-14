import { supabase } from '@thelocals/core';

export interface PricingBreakdown {
    basePrice: number;
    modifiers: {
        urgency?: number;
        timeOfDay?: number;
        demand?: number;
    };
    totalMin: number;
    totalMax: number;
    currency: 'INR';
}

/**
 * Dynamic Pricing Service with reduced rates
 */
export const dynamicPricingService = {
    /**
     * Calculate dynamic price for a service
     */
    async calculatePrice(params: {
        serviceCategory: string;
        serviceMode: 'local' | 'online';
        urgency: string;
        location?: { lat: number; lng: number };
        preferredTime?: string;
    }): Promise<PricingBreakdown> {
        // 1. Get base price from service_pricing table
        const { data: pricingData } = await supabase
            .from('service_pricing')
            .select('base_price')
            .eq('service_category', params.serviceCategory)
            .single();

        // Fallback to default reduced rates
        const basePrice = pricingData?.base_price || (params.serviceMode === 'local' ? 200 : 300);

        // 2. Calculate modifiers (reduced from original)
        const modifiers: PricingBreakdown['modifiers'] = {};

        // Urgency modifier (reduced)
        if (params.urgency === 'high') modifiers.urgency = 0.15; // +15% (was 25%)
        if (params.urgency === 'emergency') modifiers.urgency = 0.30; // +30% (was 50%)

        // Time of day modifier (reduced)
        const hour = new Date(params.preferredTime || Date.now()).getHours();
        if (hour < 8 || hour > 20) modifiers.timeOfDay = 0.10; // +10% (was 15%)

        // Demand modifier (reduced)
        if (params.location) {
            const { count } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'IN_PROGRESS')
                .eq('service_category', params.serviceCategory);

            if (count && count > 15) modifiers.demand = 0.08; // +8% (was 10%)
        }

        // 3. Calculate total with reduced variance
        const totalModifier = Object.values(modifiers).reduce((sum, val) => sum + val, 0);
        const totalMin = Math.round(basePrice * (1 + totalModifier * 0.7)); // Reduced variance
        const totalMax = Math.round(basePrice * (1 + totalModifier * 1.1)); // Reduced variance

        return {
            basePrice,
            modifiers,
            totalMin,
            totalMax,
            currency: 'INR'
        };
    },

    /**
     * Calculate fallback price when API fails or for offline estimation
     */
    calculateFallbackPrice(params: {
        estimatedCost: number;
        checklistItems: number; // Total items count
        checkedItemsCount: number; // Selected items count
    }): number {
        // Base price is 50% of estimated cost
        const basePrice = Math.round(params.estimatedCost * 0.5);

        if (params.checklistItems === 0) return basePrice;

        // Each item contributes to the remaining 50%
        const itemValue = Math.round((params.estimatedCost * 0.5) / params.checklistItems);

        return basePrice + (params.checkedItemsCount * itemValue);
    }
};
