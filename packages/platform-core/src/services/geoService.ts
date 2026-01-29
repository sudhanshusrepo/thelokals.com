import { supabase } from './supabase';
import { CONFIG } from '../config';

export interface Location {
    lat: number;
    lng: number;
}

export interface NearbyProvider {
    id: string;
    user_id: string;
    distance_km: number;
    services: string[];
    city: string;
    availability_schedule: any;
}

export const geoService = {
    /**
     * Updates the current authenticated provider's location.
     */
    updateLocation: async (lat: number, lng: number): Promise<void> => {
        const { error } = await supabase.rpc('update_provider_location', {
            p_lat: lat,
            p_lng: lng
        });

        if (error) throw error;
    },

    /**
     * Finds providers nearby a specific location for a given service category.
     */
    findNearbyProviders: async (
        serviceCategory: string,
        lat: number,
        lng: number,
        radiusKm: number = 10
    ): Promise<NearbyProvider[]> => {
        // 1. Try Edge API if configured (Stateless / Cache-First)
        if (CONFIG.EDGE_API_URL) {
            try {
                const url = new URL(`${CONFIG.EDGE_API_URL}/providers/nearby`);
                url.searchParams.append('lat', lat.toString());
                url.searchParams.append('lng', lng.toString());
                // Convert KM to Meters for the backend
                url.searchParams.append('radius', (radiusKm * 1000).toString());

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    return data as NearbyProvider[];
                } else {
                    console.warn(`Edge API Error: ${response.statusText}`);
                }
            } catch (e) {
                console.warn('Edge API fetch failed, falling back to direct RPC', e);
            }
        }

        // 2. Fallback to Direct RPC (Stateful / DB Direct)
        const { data, error } = await supabase.rpc('find_nearby_providers', {
            p_service_id: serviceCategory,  // Passed correctly now
            p_lat: lat,
            p_lng: lng,
            p_max_distance: radiusKm * 1000
        });

        if (error) throw error;
        return data || [];
    },

    /**
     * Calculates distance between two coordinates in km (Haversine formula approximation)
     * Useful for client-side quick checks.
     */
    calculateDistanceKm: (loc1: Location, loc2: Location): number => {
        const R = 6371; // Earth radius in km
        const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
        const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * (Math.PI / 180)) *
            Math.cos(loc2.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Checks if a service is enabled for a given pincode.
     * Uses Edge API/Worker with fallback to RPC.
     */
    isServiceEnabled: async (serviceCode: string, pincode: string): Promise<boolean> => {
        // 1. Try Edge API (Worker)
        if (CONFIG.EDGE_API_URL) {
            try {
                const url = new URL(`${CONFIG.EDGE_API_URL}/availability/check`);
                url.searchParams.append('service', serviceCode);
                url.searchParams.append('pincode', pincode);

                const response = await fetch(url.toString());
                if (response.ok) {
                    const data = await response.json();
                    return data.is_enabled; // Worker returns { is_enabled: boolean, ... }
                }
            } catch (e) {
                console.warn('Edge Availability Check failed, falling back to RPC', e);
            }
        }

        // 2. Fallback to Supabase RPC
        const { data, error } = await supabase.rpc('resolve_service_availability', {
            p_service_code: serviceCode,
            p_pincode: pincode
        });

        if (error) {
            console.error('Error resolving service availability:', error);
            // Default to true or false? PRD says global enabled is default, assuming RPC handles it.
            // If RPC fails entirely, safe default might be true or false depending on business risk.
            // Returning true to not block service unless explicitly disabled.
            return true;
        }

        return data && data.length > 0 ? data[0].is_enabled : true;
    },

    /**
     * Finds the L4_ZONE or L3_CITY location ID for a given coordinate.
     */
    getLocationId: async (lat: number, lng: number): Promise<string | null> => {
        const { data, error } = await supabase.rpc('get_location_from_coords', {
            p_lat: lat,
            p_lng: lng
        });

        if (error) {
            console.error('Error in getLocationId:', error);
            return null;
        }

        return data || null;
    }
};
