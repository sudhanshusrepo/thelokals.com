/**
 * Booking Flow - Address Selection (Step 3)
 * V2 Design - Choose or add address
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingStepper } from '@/components/v2';
import { useBooking } from '@/contexts/BookingContext';
import { useV2Design } from '@/lib/feature-flags';
import { designTokensV2 } from '@/theme/design-tokens-v2';

// Mock addresses
const SAVED_ADDRESSES = [
    {
        id: 'home',
        label: 'Home',
        details: '1202, Tower B, Oberoi Springs, Andheri West, Mumbai',
    },
    {
        id: 'office',
        label: 'Office',
        details: 'WeWork Chromium, Jogeshwari Vikhroli Link Road, Mumbai',
    },
];

export default function BookingAddressPage() {
    const params = useParams();
    const router = useRouter();
    const showV2 = useV2Design();
    const { bookingData, setBookingData } = useBooking();

    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [instructions, setInstructions] = useState('');

    const serviceId = params.serviceId as string;

    if (!showV2) {
        return <div>Loading...</div>;
    }

    const handleNext = () => {
        if (selectedAddress) {
            setBookingData({
                address: selectedAddress,
                notes: instructions,
            });
            router.push(`/book/${serviceId}/review`);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', padding: '20px' }}>
            <BookingStepper currentStep={3} />

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#0E121A',
                    marginBottom: '24px'
                }}>
                    Select location
                </h1>

                {/* Saved Addresses */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    {SAVED_ADDRESSES.map((addr) => (
                        <button
                            key={addr.id}
                            onClick={() => setSelectedAddress(addr.id)}
                            style={{
                                textAlign: 'left',
                                padding: '20px',
                                borderRadius: '16px',
                                border: selectedAddress === addr.id ? `2px solid ${designTokensV2.colors.gradient.end}` : '1px solid #E0E0E0',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '18px' }}>{addr.id === 'home' ? '🏠' : '🏢'}</span>
                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#0E121A' }}>{addr.label}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#666', marginLeft: '30px' }}>{addr.details}</p>

                            {selectedAddress === addr.id && (
                                <div style={{ position: 'absolute', top: '20px', right: '20px', color: designTokensV2.colors.accent.success }}>
                                    ✓
                                </div>
                            )}
                        </button>
                    ))}

                    {/* Add New Address Button */}
                    <button
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px dashed #999',
                            backgroundColor: 'transparent',
                            color: '#666',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        <span>+</span> Add new address
                    </button>
                </div>

                {/* Map Preview (Placeholder) */}
                <div style={{
                    height: '120px',
                    backgroundColor: '#E0E0E0',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                }}>
                    Map Preview Component
                </div>

                {/* Instructions */}
                <div style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        Special instructions for provider
                    </label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g. Ring the doorbell twice, beware of dog..."
                        style={{
                            width: '100%',
                            height: '100px',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '1px solid #E0E0E0',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'none',
                        }}
                    />
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleNext}
                    disabled={!selectedAddress}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: selectedAddress ? designTokensV2.colors.accent.danger : '#E0E0E0',
                        color: 'white',
                        border: 'none',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: selectedAddress ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedAddress ? designTokensV2.shadows.floating : 'none',
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
