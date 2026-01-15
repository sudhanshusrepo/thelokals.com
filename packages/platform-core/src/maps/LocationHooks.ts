'use client';

import { useState, useEffect, useCallback } from 'react';

export const useCurrentPosition = () => {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        const success = (pos: GeolocationPosition) => {
            setPosition({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            });
            setLoading(false);
        };

        const fail = (err: GeolocationPositionError) => {
            setError(err.message);
            setLoading(false);
            // Fallback to Mumbai if permission denied or error
            // setPosition({ lat: 19.0760, lng: 72.8777 }); 
        };

        navigator.geolocation.getCurrentPosition(success, fail);

        // Optional: Watch position
        // const watchId = navigator.geolocation.watchPosition(success, fail);
        // return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return { position, error, loading };
};

export const useReverseGeocode = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const geocode = useCallback(async (lat: number, lng: number) => {
        setLoading(true);
        setError(null);
        try {
            if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
                // If API not loaded yet, silently fail or retry. 
                // Since this hook is often used inside contexts or after load, 
                // we'll rely on the caller to ensure API presence or use useJsApiLoader themselves.
                // However, for safety:
                throw new Error('Google Maps API not loaded');
            }
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });

            if (response.results[0]) {
                const formatted = response.results[0].formatted_address;
                setAddress(formatted);
                return formatted;
            } else {
                throw new Error('No results found');
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { address, loading, error, geocode };
};
