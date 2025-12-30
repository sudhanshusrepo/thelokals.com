/**
 * Booking Flow - Review & Payment (Step 4)
 * V2 Design - Summary, price breakdown, and confirmation
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingStepper, StatusCard } from '@/components/v2';
import { useBooking } from '@/contexts/BookingContext';
import { useV2Design } from '@/lib/feature-flags';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export default function BookingReviewPage() {
    const params = useParams();
    const router = useRouter();
    const showV2 = useV2Design();
    const { bookingData, setBookingData } = useBooking();

    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
    const [isProcessing, setIsProcessing] = useState(false);

    const serviceId = params.serviceId as string;

    if (!showV2) {
        return <div>Loading...</div>;
    }

    const handleConfirm = async () => {
        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            router.push('/book/success');
        }, 1500);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', padding: '20px' }}>
            <BookingStepper currentStep={4} />

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#0E121A',
                    marginBottom: '24px'
                }}>
                    Review & Pay
                </h1>

                {/* Booking Summary Card */}
                <div className="mb-6">
                    <StatusCard
                        status="requested"
                        serviceName={bookingData?.serviceName || 'Deep Cleaning Service'}
                        bookingDate={bookingData?.scheduledDate || '2025-12-31'}
                        bookingTime={bookingData?.scheduledTime || '10:00 AM'}
                    />
                </div>

                {/* Price Breakdown */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Payment Summary</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                        <span>Service Total</span>
                        <span>₹{bookingData?.estimatedPrice || 799}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                        <span>Taxes & Fees</span>
                        <span>₹49</span>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#E0E0E0', margin: '12px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
                        <span>Total Pay</span>
                        <span>₹{(bookingData?.estimatedPrice || 799) + 49}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Payment Method</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['upi', 'card', 'cash'].map((method) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method as any)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: paymentMethod === method ? `2px solid ${designTokensV2.colors.gradient.end}` : '1px solid #E0E0E0',
                                    backgroundColor: paymentMethod === method ? 'rgba(138, 233, 141, 0.1)' : 'white',
                                    fontWeight: paymentMethod === method ? '600' : '400',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                }}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: designTokensV2.colors.accent.danger,
                        color: 'white',
                        border: 'none',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: isProcessing ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: designTokensV2.shadows.floating,
                        opacity: isProcessing ? 0.8 : 1,
                    }}
                >
                    {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                </button>
            </div>
        </div>
    );
}
