'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '../../../contexts/BookingContext';
import { designTokensV2 } from '../../../theme/design-tokens-v2';
import { ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentStep() {
    const router = useRouter();
    const { bookingData, clearBooking } = useBooking();
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);

        // Mock API Call
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success('Booking Confirmed!', {
            icon: '✅',
            duration: 5000,
        });

        // Clear booking data and redirect to bookings list
        clearBooking();
        router.push('/dashboard/bookings');
    };

    if (!bookingData) return <div>No booking in progress</div>;

    const total = bookingData.totalAmount || 0;
    const tax = total * 0.18;
    const grandTotal = total + tax;

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 text-v2-text-primary">Review & Pay</h2>

            {/* Summary Card */}
            <div className="bg-white p-5 rounded-v2-card shadow-v2-card mb-6">
                <h3 className="font-bold text-lg mb-4">{bookingData.serviceName}</h3>

                <div className="space-y-3 mb-4 text-sm text-gray-600 border-b border-gray-100 pb-4">
                    <div className="flex justify-between">
                        <span>Date & Time</span>
                        <span className="font-medium text-gray-900">{bookingData.scheduledDate}, {bookingData.scheduledTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Address</span>
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{bookingData.addressDetails}</span>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Item Total</span>
                        <span>₹{total}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Taxes & Fees (18%)</span>
                        <span>₹{tax.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold text-gray-900 mt-2">
                        <span>To Pay</span>
                        <span>₹{grandTotal.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-8">
                <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Payment Method</h4>

                <button className="w-full flex items-center gap-4 p-4 bg-white border border-v2-text-primary rounded-v2-card">
                    <div className="text-v2-accent-success"><CreditCard /></div>
                    <div className="font-bold flex-1 text-left">UPI / Cards (Razorpay)</div>
                    <div className="w-4 h-4 rounded-full bg-v2-text-primary border-2 border-white ring-1 ring-black" />
                </button>

                <button className="w-full flex items-center gap-4 p-4 bg-white border border-transparent shadow-sm rounded-v2-card opacity-50 cursor-not-allowed">
                    <div className="text-gray-400"><Banknote /></div>
                    <div className="font-medium flex-1 text-left text-gray-500">Cash after service</div>
                    <div className="w-4 h-4 rounded-full border border-gray-300" />
                </button>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6 bg-gray-50 p-2 rounded-lg">
                <ShieldCheck size={16} />
                <span>100% Safe & Secure Payment</span>
            </div>

            <button
                onClick={handlePayment}
                disabled={processing}
                style={{ background: designTokensV2.colors.gradient.css }}
                className="w-full py-4 rounded-v2-btn font-bold text-v2-text-primary text-lg shadow-lg active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
            >
                {processing ? 'Processing...' : `Pay ₹${grandTotal.toFixed(0)}`}
            </button>
        </div>
    );
}
