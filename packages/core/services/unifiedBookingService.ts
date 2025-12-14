import { supabase } from './supabase';
import { aiClassificationService } from './aiClassificationService';
import { dynamicPricingService } from './dynamicPricingService';

export interface BookingRequestParams {
    userId: string;
    input: string;
    inputMethod: 'voice' | 'text' | 'form';
    location?: { lat: number; lng: number };
    preferredTime?: string;
}

export interface BookingRequestResult {
    bookingId: string;
    status: 'REQUESTED';
    estimatedPrice: { min: number; max: number };
    estimatedDuration: { min: number; max: number };
    suggestedQuestions: string[];
    serviceCategory: string;
    serviceMode: 'local' | 'online';
}

/**
 * Unified Booking Service - Phase 1: REQUEST
 */
export const unifiedBookingService = {
    /**
     * Create a new booking request (Phase 1)
     */
    async createRequest(params: BookingRequestParams): Promise<BookingRequestResult> {
        try {
            // 1. AI Classification
            const classification = await aiClassificationService.classifyRequest(
                params.input,
                params.location
            );

            // 2. Check service availability
            if (params.location) {
                const city = await this.getCityFromCoordinates(params.location);
                if (city) {
                    const isAvailable = await this.checkServiceAvailability(
                        classification.serviceCategory,
                        city
                    );
                    if (!isAvailable) {
                        throw new Error(
                            `${classification.serviceCategory} is currently unavailable in ${city}. Please try again later.`
                        );
                    }
                }
            }

            // 3. Dynamic Pricing
            const pricing = await dynamicPricingService.calculatePrice({
                serviceCategory: classification.serviceCategory,
                serviceMode: classification.serviceMode,
                urgency: classification.urgency,
                location: params.location,
                preferredTime: params.preferredTime
            });

            // 4. Create booking record
            const { data: booking, error } = await supabase
                .from('bookings')
                .insert({
                    client_id: params.userId,
                    service_category: classification.serviceCategory,
                    service_mode: classification.serviceMode,
                    input_method: params.inputMethod,
                    voice_transcript: params.inputMethod === 'voice' ? params.input : null,
                    notes: params.inputMethod === 'text' ? params.input : null,
                    status: 'REQUESTED',
                    urgency: classification.urgency,
                    estimated_price_min: pricing.totalMin,
                    estimated_price_max: pricing.totalMax,
                    estimated_duration_min: classification.estimatedDuration.min,
                    estimated_duration_max: classification.estimatedDuration.max,
                    location: params.location
                        ? `POINT(${params.location.lng} ${params.location.lat})`
                        : null,
                    preferred_time: params.preferredTime,
                    ai_classification: classification,
                    pricing_breakdown: pricing,
                    booking_type: 'AI_ENHANCED',
                    payment_status: 'PENDING'
                })
                .select()
                .single();

            if (error) throw error;

            // 5. Log lifecycle event
            await this.logLifecycleEvent(booking.id, 'REQUEST', 'booking_created', {
                classification,
                pricing,
                inputMethod: params.inputMethod
            });

            return {
                bookingId: booking.id,
                status: 'REQUESTED',
                estimatedPrice: { min: pricing.totalMin, max: pricing.totalMax },
                estimatedDuration: classification.estimatedDuration,
                suggestedQuestions: classification.suggestedQuestions,
                serviceCategory: classification.serviceCategory,
                serviceMode: classification.serviceMode
            };
        } catch (error) {
            console.error('Booking request failed:', error);
            throw error;
        }
    },

    /**
     * Log lifecycle event
     */
    async logLifecycleEvent(
        bookingId: string,
        phase: string,
        eventType: string,
        eventData: any
    ): Promise<void> {
        await supabase.from('booking_lifecycle_events').insert({
            booking_id: bookingId,
            phase,
            event_type: eventType,
            event_data: eventData
        });
    },

    /**
     * Check service availability (integration with admin panel)
     */
    async checkServiceAvailability(serviceCategory: string, city: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('service_availability')
            .select('status')
            .eq('service_category_id', serviceCategory)
            .eq('location_value', city)
            .eq('location_type', 'city')
            .single();

        if (error || !data) return true; // Default to available
        return data.status === 'ENABLED';
    },

    /**
     * Get city from coordinates (reverse geocoding)
     */
    async getCityFromCoordinates(location: { lat: number; lng: number }): Promise<string | null> {
        try {
            // Use OpenStreetMap Nominatim API for free reverse geocoding
            // Note: Limit usage to 1 request per second as per OSM usage policy
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'TheLokals/1.0 (internal@thelokals.com)'
                    }
                }
            );

            if (!response.ok) {
                console.warn('Geocoding failed:', response.statusText);
                return null;
            }

            const data = await response.json();

            // Extract city from address object
            // OSM returns city, town, village, or county depending on location
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county;

            return city || null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            // Fail gracefully to allow booking flow to continue even if city check is skipped
            return null;
        }
    }
};
