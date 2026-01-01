import { supabase } from './supabase';
import { logger } from './logger';

export type PaymentMethod = 'BILLDESK' | 'PAYU' | 'UPI' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentTransaction {
    id: string;
    booking_id: string;
    amount: number;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    gateway_transaction_id?: string;
    gateway_response?: any;
    created_at: string;
    updated_at: string;
}

export interface InitiatePaymentParams {
    bookingId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    customerDetails: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface PaymentGatewayResponse {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
}

/**
 * Payment Service
 * Handles payment processing through multiple gateways
 */
export const paymentService = {
    /**
     * Initiates a payment transaction
     */
    async initiatePayment(params: InitiatePaymentParams): Promise<PaymentGatewayResponse> {
        try {
            // Create payment transaction record
            const { data: transaction, error: txnError } = await supabase
                .from('payment_transactions')
                .insert({
                    booking_id: params.bookingId,
                    amount: params.amount,
                    payment_method: params.paymentMethod,
                    status: 'PENDING',
                    customer_details: params.customerDetails
                })
                .select()
                .single();

            if (txnError) {
                logger.error('Error creating payment transaction', { error: txnError, params });
                throw txnError;
            }

            // Route to appropriate payment gateway
            switch (params.paymentMethod) {
                case 'BILLDESK':
                    return await this.processBillDeskPayment(transaction.id, params);
                case 'PAYU':
                    return await this.processPayUPayment(transaction.id, params);
                case 'UPI':
                    return await this.processUPIPayment(transaction.id, params);
                case 'CARD':
                    return await this.processCardPayment(transaction.id, params);
                default:
                    throw new Error('Unsupported payment method');
            }
        } catch (error) {
            logger.error('Payment initiation failed', { error, params });
            throw error;
        }
    },

    /**
     * BillDesk Payment Integration
     */
    async processBillDeskPayment(transactionId: string, params: InitiatePaymentParams): Promise<PaymentGatewayResponse> {
        try {
            // Call backend function to generate BillDesk payment URL
            const { data, error } = await supabase.rpc('create_billdesk_payment', {
                p_transaction_id: transactionId,
                p_amount: params.amount,
                p_customer_name: params.customerDetails.name,
                p_customer_email: params.customerDetails.email,
                p_customer_phone: params.customerDetails.phone
            });

            if (error) throw error;

            return {
                success: true,
                transactionId: transactionId,
                paymentUrl: data.payment_url
            };
        } catch (error) {
            logger.error('BillDesk payment failed', { error, transactionId });
            await this.updatePaymentStatus(transactionId, 'FAILED');
            return {
                success: false,
                error: 'Failed to initiate BillDesk payment'
            };
        }
    },

    /**
     * PayU Payment Integration
     */
    async processPayUPayment(transactionId: string, params: InitiatePaymentParams): Promise<PaymentGatewayResponse> {
        try {
            const { data, error } = await supabase.rpc('create_payu_payment', {
                p_transaction_id: transactionId,
                p_amount: params.amount,
                p_customer_name: params.customerDetails.name,
                p_customer_email: params.customerDetails.email,
                p_customer_phone: params.customerDetails.phone
            });

            if (error) throw error;

            return {
                success: true,
                transactionId: transactionId,
                paymentUrl: data.payment_url
            };
        } catch (error) {
            logger.error('PayU payment failed', { error, transactionId });
            await this.updatePaymentStatus(transactionId, 'FAILED');
            return {
                success: false,
                error: 'Failed to initiate PayU payment'
            };
        }
    },

    /**
     * UPI Payment Integration
     */
    async processUPIPayment(transactionId: string, params: InitiatePaymentParams): Promise<PaymentGatewayResponse> {
        try {
            const { data, error } = await supabase.rpc('create_upi_payment', {
                p_transaction_id: transactionId,
                p_amount: params.amount,
                p_customer_phone: params.customerDetails.phone
            });

            if (error) throw error;

            return {
                success: true,
                transactionId: transactionId,
                paymentUrl: data.upi_intent_url
            };
        } catch (error) {
            logger.error('UPI payment failed', { error, transactionId });
            await this.updatePaymentStatus(transactionId, 'FAILED');
            return {
                success: false,
                error: 'Failed to initiate UPI payment'
            };
        }
    },

    /**
     * Card Payment Integration (Fallback/Test)
     */
    async processCardPayment(transactionId: string, params: InitiatePaymentParams): Promise<PaymentGatewayResponse> {
        try {
            // For now, simulate card payment (in production, integrate with Stripe/Razorpay)
            await this.updatePaymentStatus(transactionId, 'PROCESSING');

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.updatePaymentStatus(transactionId, 'SUCCESS');
            await this.updateBookingPaymentStatus(params.bookingId, 'PAID');

            return {
                success: true,
                transactionId: transactionId
            };
        } catch (error) {
            logger.error('Card payment failed', { error, transactionId });
            await this.updatePaymentStatus(transactionId, 'FAILED');
            return {
                success: false,
                error: 'Card payment failed'
            };
        }
    },

    /**
     * Verify payment callback from gateway
     */
    async verifyPayment(transactionId: string, gatewayResponse: any): Promise<boolean> {
        try {
            const { data: transaction, error } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('id', transactionId)
                .single();

            if (error || !transaction) {
                logger.error('Transaction not found', { transactionId });
                return false;
            }

            // Update transaction with gateway response
            await supabase
                .from('payment_transactions')
                .update({
                    status: gatewayResponse.status === 'success' ? 'SUCCESS' : 'FAILED',
                    gateway_transaction_id: gatewayResponse.txnId,
                    gateway_response: gatewayResponse,
                    updated_at: new Date().toISOString()
                })
                .eq('id', transactionId);

            // Update booking payment status
            if (gatewayResponse.status === 'success') {
                await this.updateBookingPaymentStatus(transaction.booking_id, 'PAID');
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Payment verification failed', { error, transactionId });
            return false;
        }
    },

    /**
     * Update payment transaction status
     */
    async updatePaymentStatus(transactionId: string, status: PaymentStatus): Promise<void> {
        const { error } = await supabase
            .from('payment_transactions')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', transactionId);

        if (error) {
            logger.error('Failed to update payment status', { error, transactionId, status });
            throw error;
        }
    },

    /**
     * Update booking payment status
     */
    async updateBookingPaymentStatus(bookingId: string, paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'): Promise<void> {
        const { error } = await supabase
            .from('bookings')
            .update({ payment_status: paymentStatus })
            .eq('id', bookingId);

        if (error) {
            logger.error('Failed to update booking payment status', { error, bookingId, paymentStatus });
            throw error;
        }
    },

    /**
     * Get payment transaction details
     */
    async getPaymentTransaction(transactionId: string): Promise<PaymentTransaction | null> {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error) {
            logger.error('Failed to fetch payment transaction', { error, transactionId });
            return null;
        }

        return data;
    },

    /**
     * Get all payment transactions for a booking
     */
    async getBookingPayments(bookingId: string): Promise<PaymentTransaction[]> {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch booking payments', { error, bookingId });
            return [];
        }

        return data || [];
    },

    /**
     * Get payment history for a provider
     */
    async getProviderPaymentHistory(providerId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select(`
                *,
                bookings!inner (
                    provider_id,
                    services (name),
                    profiles:customer_id (full_name)
                )
            `)
            .eq('bookings.provider_id', providerId)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to fetch provider payment history', { error, providerId });
            return [];
        }

        return data || [];
    }
};
