'use client';

import React, { useEffect, useState } from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { BookingHistoryList } from '../../components/booking/BookingHistoryList';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, Booking } from '@thelocals/platform-core';

export default function BookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadBookings();
        }
    }, [user]);

    const loadBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await bookingService.getUserBookings(user.id);
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-50 pb-24">
                {/* Header */}
                <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-30">
                    <h1 className="text-xl font-bold text-neutral-900">My Bookings</h1>
                </header>

                {/* Content */}
                <main className="p-4">
                    <BookingHistoryList bookings={bookings} loading={loading} />
                </main>
            </div>
        </AuthGuard>
    );
}
