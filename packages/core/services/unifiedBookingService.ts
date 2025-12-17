import { supabase } from './supabase';
import { aiClassificationService } from './aiClassificationService';
import { dynamicPricingService } from './dynamicPricingService';
import { geoService } from './geoService';

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
    estimatedPrice: number;
    tierReached: string;
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

            // 2. Resolve Location & Check availability
            let locationId: string | undefined;
            if (params.location) {
                locationId = await geoService.getLocationId(params.location.lat, params.location.lng) || undefined;

                // Bible Flow 2: Emergency Shutdown Check
                if (locationId) {
                    const { data: loc } = await supabase
                        .from('locations')
                        .select('is_emergency_disabled, emergency_reason')
                        .eq('id', locationId)
                        .single();

                    if (loc?.is_emergency_disabled) {
                        throw new Error(
                            `Service is temporarily unavailable in this area: ${loc.emergency_reason || 'Emergency maintenance'}.`
                        );
                    }
                }
            }

            // 3. Dynamic Pricing (3-Tier Fallback)
            const pricing = await dynamicPricingService.calculatePrice({
                serviceCode: classification.serviceCode || classification.serviceCategory, // Use code if AI provided it
                locationId: locationId
            });

            // 4. Create booking record (Bible Schema v1.0)
            const { data: booking, error } = await supabase
                .from('bookings')
                .insert({
                    user_id: params.userId,
                    service_code: classification.serviceCode || classification.serviceCategory,
                    service_name: classification.serviceCategory, // Friendly name
                    booking_type: 'AI_ENHANCED',
                    status: 'REQUESTED',
                    requirements: classification,
                    base_price_cents: pricing.basePrice * 100,
                    surge_multiplier: pricing.demandMultiplier,
                    final_price_cents: pricing.finalPrice * 100,
                    location: params.location
                        ? `POINT(${params.location.lng} ${params.location.lat})`
                        : null,
                    preferred_time: params.preferredTime,
                    payment_status: 'PENDING'
                })
                .select()
                .single();

            if (error) throw error;

            // 5. Log lifecycle event
            await this.logLifecycleEvent(booking.id, 'REQUEST', 'booking_created', {
                classification,
                pricing,
                locationId
            });

            return {
                bookingId: booking.id,
                status: 'REQUESTED',
                estimatedPrice: pricing.finalPrice,
                tierReached: pricing.tierReached,
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
     * Check service availability (integration with new locations table)
     */
    async checkServiceAvailability(serviceCode: string, locationId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('locations')
            .select('enabled_services')
            .eq('id', locationId)
            .single();

        if (error || !data) return true; // Default to available if check fails (fail open)

        // enabled_services is a JSON array of strings e.g. ["plumbing", "electrical"]
        const enabledServices = data.enabled_services as string[];
        return Array.isArray(enabledServices) && enabledServices.includes(serviceCode);
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
    ,

    /**
     * Geocode an address to coordinates (Forward Geocoding)
     */
    async geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
        try {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
                {
                    headers: {
                        'User-Agent': 'TheLokals/1.0 (internal@thelokals.com)'
                    }
                }
            );

            if (!response.ok) {
                console.warn('Forward geocoding failed:', response.statusText);
                return null;
            }

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }

            return null;
        } catch (error) {
            console.error('Forward geocoding error:', error);
            return null;
        }
    }
};
