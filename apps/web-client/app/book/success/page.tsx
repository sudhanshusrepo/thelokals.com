/**
 * Booking Success Page
 * V2 Design - Success animation and track booking CTA
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useV2Design } from '@/lib/feature-flags';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export default function BookingSuccessPage() {
    const router = useRouter();
    const showV2 = useV2Design();

    if (!showV2) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F0F0F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>

            {/* Success Animation Circle */}
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: designTokensV2.colors.gradient.start, // Amber
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
                boxShadow: '0 8px 32px rgba(247, 200, 70, 0.3)',
                animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
                <span style={{ fontSize: '48px', color: 'white' }}>✓</span>
            </div>

            <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#0E121A',
                marginBottom: '12px',
                textAlign: 'center',
            }}>
                Booking Confirmed!
            </h1>

            <p style={{
                fontSize: '16px',
                color: '#666',
                textAlign: 'center',
                maxWidth: '300px',
                marginBottom: '48px',
            }}>
                Best provider has been assigned. You can track your booking status below.
            </p>

            {/* Track Booking Button */}
            <button
                onClick={() => router.push('/bookings/123')}
                style={{
                    width: '100%',
                    maxWidth: '320px',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: designTokensV2.colors.accent.danger,
                    color: 'white',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: designTokensV2.shadows.floating,
                    marginBottom: '16px',
                }}
            >
                Track Booking
            </button>

            <button
                onClick={() => router.push('/')}
                style={{
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#666',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                }}
            >
                Back to Home
            </button>

            <style jsx>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
