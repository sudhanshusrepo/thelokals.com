export const PricingUtils = {
    /**
     * Formats a number as a currency string (INR).
     * @param {number} amount
     * @returns {string} e.g. "₹500"
     */
    formatPrice: (amount: number | string | undefined | null): string => {
        if (amount === undefined || amount === null) return '₹--';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return '₹--';

        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    }
};
