'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AVAILABLE_CITIES, CITY_COORDINATES } from '@thelocals/platform-core';

// --- Types ---
export interface LocationState {
    status: 'idle' | 'detecting' | 'resolved' | 'error';
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    city: string | null;
    source: 'auto' | 'manual';
    timestamp: number;
}

interface LocationContextType {
    locationState: LocationState;
    detectLocation: () => Promise<void>;
    updateLocation: (lat: number, lng: number, address: string, city?: string) => void;
    setLocation: (loc: { lat: number; lng: number; address: string; city?: string }) => void;
}

const STORAGE_KEY = 'user_location_v1';
const STALE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

// --- Defaults ---
const DEFAULT_CITY = 'Mumbai';
const DEFAULT_COORDS = CITY_COORDINATES['Mumbai'];

const initialState: LocationState = {
    status: 'idle',
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    source: 'auto',
    timestamp: 0,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<LocationState>(initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    // Helper: Reverse Geocode (Internal)
    const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string; city: string } | null> => {
        try {
            if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
                console.warn("Google Maps API not loaded yet.");
                return null;
            }
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });

            if (response.results[0]) {
                const address = response.results[0].formatted_address;
                // Extract City (Locality)
                let city = DEFAULT_CITY;
                for (const comp of response.results[0].address_components) {
                    if (comp.types.includes('locality')) {
                        city = comp.long_name;
                        break;
                    }
                }

                // Match with available cities or default
                const matchedCity = AVAILABLE_CITIES.find(c => city.includes(c)) || DEFAULT_CITY;
                return { address, city: matchedCity };
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
        }
        return null;
    };

    // 1. Initialize: Load from Storage or Detect
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: LocationState = JSON.parse(stored);
                const isFresh = (Date.now() - parsed.timestamp) < STALE_THRESHOLD;

                if (isFresh && parsed.latitude && parsed.longitude) {
                    setState(parsed);
                    setIsInitialized(true);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse stored location", e);
            }
        }

        // If no valid storage, trigger detection
        detectLocation();
        setIsInitialized(true);
    }, []);

    // 2. Detect Logic
    const detectLocation = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'detecting' }));

        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, status: 'error' }));
            return;
        }

        // Safety timeout in case geolocation hangs
        const safetyTimeout = setTimeout(() => {
            console.warn("Location detection timed out (safety).");
            const newState: LocationState = {
                status: 'resolved',
                latitude: DEFAULT_COORDS.lat,
                longitude: DEFAULT_COORDS.lng,
                address: 'Select Location',
                city: 'Gurugram',
                source: 'auto',
                timestamp: Date.now()
            };
            setState(newState);
            // localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); // Don't save default
        }, 5000); // 5 seconds

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(safetyTimeout);
                const { latitude, longitude } = position.coords;

                // Attempt Reverse Geocode immediately checking Google availability
                const geoResult = await reverseGeocode(latitude, longitude);

                const newState: LocationState = {
                    status: 'resolved',
                    latitude,
                    longitude,
                    address: geoResult?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                    city: geoResult?.city || 'Gurugram',
                    source: 'auto',
                    timestamp: Date.now()
                };
                setState(newState);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            },
            (error) => {
                clearTimeout(safetyTimeout);
                console.warn("Geolocation error:", error);

                // Fallback to Gurugram
                const newState: LocationState = {
                    status: 'resolved',
                    latitude: DEFAULT_COORDS.lat,
                    longitude: DEFAULT_COORDS.lng,
                    address: 'Gurugram, Haryana',
                    city: 'Gurugram',
                    source: 'manual',
                    timestamp: Date.now()
                };
                setState(newState);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);

    const updateLocation = useCallback((lat: number, lng: number, address: string, city?: string) => {
        const newState: LocationState = {
            status: 'resolved',
            latitude: lat,
            longitude: lng,
            address,
            city: city || DEFAULT_CITY,
            source: 'manual',
            timestamp: Date.now()
        };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }, []);

    const setLocation = useCallback((loc: { lat: number; lng: number; address: string; city?: string }) => {
        updateLocation(loc.lat, loc.lng, loc.address, loc.city);
    }, [updateLocation]);

    return (
        <LocationContext.Provider value={{ locationState: state, detectLocation, updateLocation, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) throw new Error('useLocation must be used within LocationProvider');
    return context;
};
