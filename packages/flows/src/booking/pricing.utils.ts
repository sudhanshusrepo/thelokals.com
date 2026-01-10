import { ServiceItem } from '@thelocals/platform-core';

export interface PriceEstimate {
    basePrice: number;
    taxes: number;
    total: number;
    currency: string;
}

export const PricingUtils = {
    calculateEstimate: (item: ServiceItem, quantity: number = 1): PriceEstimate => {
        let basePrice = item.base_price * quantity;

        // Example Tax Logic (18% GST)
        const taxRate = 0.18;
        const taxes = Math.round(basePrice * taxRate);
        const total = basePrice + taxes;

        return {
            basePrice,
            taxes,
            total,
            currency: 'INR'
        };
    },

    formatPrice: (amount: number, currency: string = 'INR'): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    }
};
