import { supabase } from './supabase';
import { geoService } from './geoService';

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

        let providerIds: string[] = [];

        if (booking.delivery_mode === 'ONLINE') {
            // For ONLINE: Find active providers offering this service, regardless of location
            // TODO: Add timezone/schedule matching logic in Phase 3 iterations
            const { data, error } = await supabase
                .from('providers')
                .select('id')
                .eq('is_active', true)
                .contains('services', [booking.service_category])
                .limit(20);

            if (error) throw error;
            providerIds = data.map((p: { id: string }) => p.id);
        } else {
            // For LOCAL: Use GeoService (PostGIS)
            // Defaulting to 15km radius if not specified
            const lat = booking.location?.coordinates?.[1] || 0;
            const lng = booking.location?.coordinates?.[0] || 0;

            if (lat !== 0 || lng !== 0) {
                // Use newly created findNearbyProviders RPC via GeoService
                // Note: We need to import geoService at the top
                const nearby = await geoService.findNearbyProviders(
                    booking.service_category,
                    lat,
                    lng,
                    15 // radiusKm
                );
                providerIds = nearby.map(p => p.id);
            } else {
                // Fallback if no location: Match by City if available (Legacy/MVP)
                let query = supabase
                    .from('providers')
                    .select('id')
                    .eq('is_active', true)
                    .contains('services', [booking.service_category]);

                if (booking.address && booking.address.city) {
                    query = query.eq('city', booking.address.city);
                }

                const { data, error } = await query;
                if (error) throw error;
                providerIds = data.map((p: { id: string }) => p.id);
            }
        }

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
