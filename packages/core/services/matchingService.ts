import { supabase } from './supabase';

export interface MatchingResult {
    matchedProviderIds: string[];
    count: number;
}

export const matchingService = {
    /**
     * Find suitable providers for a booking
     */
    async findProviders(bookingId: string): Promise<MatchingResult> {
        // 1. Fetch booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) throw new Error('Booking not found');

        let query = supabase
            .from('providers')
            .select('id')
            .eq('is_active', true)
            .contains('services', [booking.service_category]); // Assuming services is an array or jsonb

        // 2. Filter by Service Mode & Location
        if (booking.service_mode === 'local' && booking.location) {
            // Use RPC for PostGIS distance search if available, or client-side filter for MVP
            // For MVP: We'll assume providers have a 'city' field and match on that
            // Ideally: .rpc('nearby_providers', { lat, lng, radius })

            // Extract city from booking address or location if available
            // This is a simplification. In production, use PostGIS.
            if (booking.address && booking.address.city) {
                query = query.eq('city', booking.address.city);
            }
        }

        // 3. Execute Query
        const { data: providers, error: providerError } = await query;

        if (providerError) throw providerError;

        const providerIds = providers.map(p => p.id);

        return {
            matchedProviderIds: providerIds,
            count: providerIds.length
        };
    },

    /**
     * Create requests for providers
     */
    async notifyProviders(bookingId: string, providerIds: string[]): Promise<void> {
        if (providerIds.length === 0) return;

        const requests = providerIds.map(providerId => ({
            booking_id: bookingId,
            provider_id: providerId,
            status: 'PENDING'
        }));

        const { error } = await supabase
            .from('booking_requests')
            .insert(requests);

        if (error) throw error;

        // Update booking status to MATCHING or PENDING
        await supabase
            .from('bookings')
            .update({ status: 'PENDING' })
            .eq('id', bookingId);
    },

    /**
     * Accept a booking (Provider side)
     */
    async acceptBooking(bookingId: string, providerId: string): Promise<boolean> {
        const { data, error } = await supabase.rpc('accept_booking', {
            p_booking_id: bookingId,
            p_provider_id: providerId
        });

        if (error) throw error;
        return data.success;
    },

    /**
     * Reject a booking (Provider side)
     */
    async rejectBooking(bookingId: string, providerId: string): Promise<void> {
        const { error } = await supabase
            .from('booking_requests')
            .update({ status: 'REJECTED' })
            .eq('booking_id', bookingId)
            .eq('provider_id', providerId);

        if (error) throw error;
    }
};
