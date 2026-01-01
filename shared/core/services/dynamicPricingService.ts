import { supabase } from './supabase';

export interface PricingBreakdown {
    basePrice: number;
    dynamicPrice?: number;
    demandMultiplier: number;
    finalPrice: number;
    tierReached: 'tier1_base' | 'tier2_ml' | 'tier3_demand';
    currency: 'INR';
}

/**
 * Enhanced Dynamic Pricing Service following 3-Tier Fallback Strategy (Bible v1.0 Section 6)
 */
export const dynamicPricingService = {
    /**
     * Calculate 3-tier fallback price
     */
    async calculatePrice(params: {
        serviceCode: string;
        locationId?: string; // UUID from locations table
        pincode?: string;
    }): Promise<PricingBreakdown> {
        // TIER 1: Base Price (Source of Truth)
        const { data: service } = await supabase
            .from('services')
            .select('*')
            .eq('code', params.serviceCode)
            .single();

        if (!service) {
            throw new Error(`Service not found: ${params.serviceCode}`);
        }

        const basePrice = service.base_price_cents / 100;
        let finalBasePrice = basePrice;
        let tierReached: PricingBreakdown['tierReached'] = 'tier1_base';

        // TIER 2: ML-Operated Price (Fallback if crawler is active)
        const isMLFresh = service.price_last_updated &&
            (new Date().getTime() - new Date(service.price_last_updated).getTime() < 24 * 60 * 60 * 1000);

        if (isMLFresh && service.dynamic_base_price_cents) {
            finalBasePrice = service.dynamic_base_price_cents / 100;
            tierReached = 'tier2_ml';
        }

        // TIER 3: Demand-Adjusted Pricing
        let demandMultiplier = 1.0;

        // Check real-time demand analytics
        const { data: demandData } = await supabase
            .from('demand_analytics')
            .select('demand_multiplier')
            .eq('service_type', params.serviceCode)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (demandData?.demand_multiplier) {
            demandMultiplier = Number(demandData.demand_multiplier);
            tierReached = 'tier3_demand';
        } else if (params.locationId) {
            // Fallback to location-level surge
            const { data: loc } = await supabase
                .from('locations')
                .select('surge_multiplier')
                .eq('id', params.locationId)
                .single();

            if (loc?.surge_multiplier && Number(loc.surge_multiplier) > 1) {
                demandMultiplier = Number(loc.surge_multiplier);
                tierReached = 'tier3_demand';
            }
        }

        const finalPrice = Math.round(finalBasePrice * demandMultiplier);

        return {
            basePrice,
            dynamicPrice: tierReached === 'tier2_ml' ? finalBasePrice : undefined,
            demandMultiplier,
            finalPrice,
            tierReached,
            currency: 'INR'
        };
    },

    /**
     * Legacy/Simplified calculation for quick estimates
     */
    calculateFallbackPrice(params: {
        estimatedCost: number;
        checklistItems: number;
        checkedItemsCount: number;
    }): number {
        const basePrice = Math.round(params.estimatedCost * 0.5);
        if (params.checklistItems === 0) return basePrice;
        const itemValue = Math.round((params.estimatedCost * 0.5) / params.checklistItems);
        return basePrice + (params.checkedItemsCount * itemValue);
    }
};
