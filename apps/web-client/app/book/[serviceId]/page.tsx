/**
 * Booking Flow - Package Selection (Step 1)
 * V2 Design - Choose service package
 */

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingStepper } from '@/components/v2';
import { useBooking } from '@/contexts/BookingContext';
import { useV2Design } from '@/lib/feature-flags';

const PACKAGES = [
    {
        id: 'basic',
        name: 'Basic Clean',
        price: 499,
        duration: '90 min',
        description: 'Essential cleaning for your home',
    },
    {
        id: 'deep',
        name: 'Deep Clean',
        price: 799,
        duration: '2 hours',
        description: 'Thorough cleaning of all areas',
        popular: true,
    },
    {
        id: 'plan',
        name: 'Monthly Plan',
        price: 1999,
        duration: 'Save 20%',
        description: '4 sessions per month',
    },
];

export default function BookingPackagePage() {
    const params = useParams();
    const router = useRouter();
    const showV2 = useV2Design();
    const { bookingData, setBookingData } = useBooking();

    const serviceId = params.serviceId as string;

    if (!showV2) {
        return <div>Loading...</div>;
    }

    const handleSelectPackage = (pkg: typeof PACKAGES[0]) => {
        setBookingData({
            serviceCode: serviceId,
            serviceName: 'Deep Cleaning Service', // In real app, fetch from API
            estimatedPrice: pkg.price,
        });
        router.push(`/book/${serviceId}/slots`);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', padding: '20px' }}>
            {/* Stepper */}
            <BookingStepper currentStep={1} />

            {/* Header */}
            <div style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '24px' }}>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#0E121A',
                        marginBottom: '8px',
                    }}
                >
                    Choose your package
                </h1>
                <p style={{ fontSize: '16px', color: '#666' }}>
                    Select the cleaning package that fits your needs
                </p>
            </div>

            {/* Packages */}
            <div
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                {PACKAGES.map((pkg) => (
                    <button
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg)}
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '16px',
                            border: pkg.popular ? '3px solid #F7C846' : '1px solid #E0E0E0',
                            boxShadow: '0 4px 16px rgba(14,18,26,0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            textAlign: 'left',
                        }}
                    >
                        {pkg.popular && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    right: '20px',
                                    backgroundColor: '#F7C846',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#0E121A',
                                }}
                            >
                                Most Popular
                            </div>
                        )}

                        <div style={{ marginBottom: '12px' }}>
                            <h3
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#0E121A',
                                    marginBottom: '4px',
                                }}
                            >
                                {pkg.name}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#666' }}>{pkg.description}</p>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#0E121A' }}>
                                    ₹{pkg.price}
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>{pkg.duration}</div>
                            </div>
                            <div
                                style={{
                                    backgroundColor: '#FC574E',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                }}
                            >
                                Select →
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
