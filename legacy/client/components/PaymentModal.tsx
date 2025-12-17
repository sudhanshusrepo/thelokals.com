import React, { useState } from 'react';
import { Booking } from '../../core/types';
import { paymentService, PaymentMethod } from '../../core/services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface PaymentModalProps {
    booking: Booking;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose, onPaymentSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const { user } = useAuth();
    const { showToast } = useToast();

    const paymentMethods = [
        {
            id: 'UPI' as PaymentMethod,
            name: 'UPI',
            icon: '📱',
            description: 'Pay via Google Pay, PhonePe, Paytm',
            popular: true
        },
        {
            id: 'BILLDESK' as PaymentMethod,
            name: 'BillDesk',
            icon: '💳',
            description: 'Credit/Debit Cards, Net Banking'
        },
        {
            id: 'PAYU' as PaymentMethod,
            name: 'PayU',
            icon: '🏦',
            description: 'All payment methods'
        },
        {
            id: 'CARD' as PaymentMethod,
            name: 'Card Payment',
            icon: '💳',
            description: 'Direct card payment'
        }
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            showToast('Please select a payment method', 'warning');
            return;
        }

        if (!user) {
            showToast('Please login to continue', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            const response = await paymentService.initiatePayment({
                bookingId: booking.id,
                amount: booking.final_cost || booking.estimated_cost || 0,
                paymentMethod: selectedMethod,
                customerDetails: {
                    name: user.user_metadata?.name || user.email || 'Customer',
                    email: user.email || '',
                    phone: user.user_metadata?.phone || ''
                }
            });

            if (response.success) {
                if (response.paymentUrl) {
                    // Redirect to payment gateway
                    window.location.href = response.paymentUrl;
                } else {
                    // Payment completed (for card/test payments)
                    showToast('Payment successful!', 'success');
                    onPaymentSuccess();
                    onClose();
                }
            } else {
                showToast(response.error || 'Payment failed. Please try again.', 'error');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment failed', error);
            showToast('Payment failed. Please try again.', 'error');
            setIsProcessing(false);
        }
    };

    const amount = booking.final_cost || booking.estimated_cost || 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
                >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                            💰
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Payment</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Service by {booking.worker?.name || 'Professional'}
                        </p>
                    </div>

                    {/* Amount Summary */}
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-teal-100 dark:border-teal-800 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 dark:text-gray-300 text-sm">Service Fee</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>Platform Fee</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="border-t border-teal-200 dark:border-teal-700 mt-3 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                            <span className="font-bold text-2xl text-teal-600 dark:text-teal-400">₹{amount}</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3 mb-6">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                            Select Payment Method
                        </h3>
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${selectedMethod === method.id
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {method.popular && (
                                    <span className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                        Popular
                                    </span>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{method.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 dark:text-white">{method.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{method.description}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id
                                            ? 'border-teal-500 bg-teal-500'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                        {selectedMethod === method.id && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || !selectedMethod}
                        className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg mt-4 ${isProcessing || !selectedMethod
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] shadow-teal-200 dark:shadow-none'
                            }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            `Pay ₹${amount}`
                        )}
                    </button>

                    {/* Security Badge */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secured by 256-bit SSL encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
