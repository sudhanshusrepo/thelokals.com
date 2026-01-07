
export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    client_secret: string;
    status: 'pending' | 'succeeded' | 'failed';
}

export const paymentService = {
    // Mock creating a payment intent
    createPaymentIntent: async (amount: number, currency = 'usd'): Promise<PaymentIntent> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'pi_' + Math.random().toString(36).substr(2, 9),
                    amount,
                    currency,
                    client_secret: 'mock_secret_' + Math.random().toString(36),
                    status: 'pending'
                });
            }, 1000);
        });
    },

    // Mock confirming transaction
    confirmPayment: async (paymentIntentId: string): Promise<{ success: boolean }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1500);
        });
    }
};
