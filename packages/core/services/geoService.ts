import { supabase } from './supabase';

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
        const { data, error } = await supabase.rpc('find_nearby_providers', {
            p_service_category: serviceCategory,
            p_lat: lat,
            p_lng: lng,
            p_radius_km: radiusKm
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
    }
};
