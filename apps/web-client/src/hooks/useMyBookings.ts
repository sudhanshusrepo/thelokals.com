import { useState, useEffect } from 'react';
import { bookingService } from '@thelocals/platform-core/services/bookingService';
import { Booking } from '@thelocals/platform-core/types';
import { useAuth } from '../contexts/AuthContext';

export function useMyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setBookings([]);
            setLoading(false);
            return;
        }

        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await bookingService.getUserBookings(user.id);
                setBookings(data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch bookings', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    // Derived state: Active booking (most recent non-completed/cancelled)
    const activeBooking = bookings.find(b =>
        ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'].includes(b.status)
    );

    return { bookings, activeBooking, loading, error };
}
