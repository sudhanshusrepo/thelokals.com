import { useEffect } from 'react';
import { supabase } from '@thelocals/core/services/supabase';

export const useBookingSync = (bookingId?: string) => {
    useEffect(() => {
        if (!bookingId) return;

        console.log(`[Sync] Subscribing to updates for booking ${bookingId}...`);

        const channel = supabase
            .channel(`booking-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`
                },
                (payload: any) => {
                    console.log('[Sync] Received update:', payload);
                    // In real implementation: updateBookingData(payload.new);
                }
            )
            .subscribe();

        return () => {
            console.log(`[Sync] Unsubscribing from booking ${bookingId}`);
            supabase.removeChannel(channel);
        };
    }, [bookingId]);
};
