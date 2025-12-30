/**
 * Booking Flow - Slot Selection (Step 2)
 * V2 Design - Choose date and time
 */

'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookingStepper } from '@/components/v2';
import { useBooking } from '@/contexts/BookingContext';
import { useV2Design } from '@/lib/feature-flags';
import { designTokensV2 } from '@/theme/design-tokens-v2';

// Mock availability data
const DATES = [
    { label: 'Today', date: '2025-12-31' },
    { label: 'Tomorrow', date: '2026-01-01' },
    { label: 'Fri', date: '2026-01-02' },
    { label: 'Sat', date: '2026-01-03' },
    { label: 'Sun', date: '2026-01-04' },
];

const TIME_SLOTS = [
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
];

export default function BookingSlotsPage() {
    const params = useParams();
    const router = useRouter();
    const showV2 = useV2Design();
    const { bookingData, setBookingData } = useBooking();

    const [selectedDate, setSelectedDate] = useState(DATES[0].date);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const serviceId = params.serviceId as string;

    if (!showV2) {
        return <div>Loading...</div>;
    }

    const handleNext = () => {
        if (selectedDate && selectedTime) {
            setBookingData({
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
            });
            router.push(`/book/${serviceId}/address`);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', padding: '20px' }}>
            <BookingStepper currentStep={2} />

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#0E121A',
                    marginBottom: '24px'
                }}>
                    Select a time slot
                </h1>

                {/* Date Strip */}
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Date</h2>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }} className="scrollbar-hide">
                        {DATES.map((date) => (
                            <button
                                key={date.date}
                                onClick={() => setSelectedDate(date.date)}
                                style={{
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: selectedDate === date.date ? `2px solid ${designTokensV2.colors.gradient.start}` : '1px solid #E0E0E0',
                                    backgroundColor: selectedDate === date.date ? 'rgba(247, 200, 70, 0.1)' : 'white',
                                    minWidth: '80px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{date.label}</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0E121A' }}>
                                    {date.date.split('-')[2]}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Grid */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Time</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                    }}>
                        {TIME_SLOTS.map((time) => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: selectedTime === time ? `2px solid ${designTokensV2.colors.gradient.end}` : '1px solid #E0E0E0',
                                    backgroundColor: selectedTime === time ? 'rgba(138, 233, 141, 0.1)' : 'white',
                                    fontSize: '14px',
                                    fontWeight: selectedTime === time ? '600' : '400',
                                    color: '#0E121A',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Floating Action Button for Next */}
                <button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        backgroundColor: selectedDate && selectedTime ? designTokensV2.colors.accent.danger : '#E0E0E0',
                        color: 'white',
                        border: 'none',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedDate && selectedTime ? designTokensV2.shadows.floating : 'none',
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
