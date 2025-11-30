import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '@core/types';

interface GeolocationState {
    location: Coordinates | null;
    error: string | null;
    isLoading: boolean;
}

export const useGeolocation = (defaultLocation?: Coordinates) => {
    const [state, setState] = useState<GeolocationState>(() => {
        // Try to load from localStorage on initial render
        try {
            const cached = localStorage.getItem('user_location');
            if (cached) {
                const parsed = JSON.parse(cached);
                // Check if cache is valid (e.g., less than 24 hours old)
                const now = new Date().getTime();
                if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    return {
                        location: parsed.coords,
                        error: null,
                        isLoading: false
                    };
                }
            }
        } catch (e) {
            console.error('Failed to load location from cache', e);
        }
        return {
            location: defaultLocation || null,
            error: null,
            isLoading: false,
        };
    });

    const updateCache = (coords: Coordinates) => {
        try {
            localStorage.setItem('user_location', JSON.stringify({
                coords,
                timestamp: new Date().getTime()
            }));
        } catch (e) {
            console.error('Failed to save location to cache', e);
        }
    };

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
                isLoading: false
            }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateCache(coords);
                setState({
                    location: coords,
                    error: null,
                    isLoading: false
                });
            },
            (error) => {
                let errorMessage = 'An unknown error occurred.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'User denied the request for Geolocation.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                }
                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                    isLoading: false
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    const getLocationPromise = useCallback((): Promise<Coordinates> => {
        return new Promise((resolve, reject) => {
            // Check cache first if available and valid
            try {
                const cached = localStorage.getItem('user_location');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    const now = new Date().getTime();
                    // Return cached if less than 1 hour old for promise calls (stricter)
                    if (now - parsed.timestamp < 60 * 60 * 1000) {
                        setState(prev => ({ ...prev, location: parsed.coords }));
                        resolve(parsed.coords);
                        return;
                    }
                }
            } catch (e) {
                // Ignore cache errors
            }

            if (!navigator.geolocation) {
                const errorMsg = 'Geolocation is not supported by your browser';
                setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
                reject(new Error(errorMsg));
                return;
            }

            setState(prev => ({ ...prev, isLoading: true, error: null }));

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    updateCache(coords);
                    setState({
                        location: coords,
                        error: null,
                        isLoading: false
                    });
                    resolve(coords);
                },
                (error) => {
                    let errorMessage = 'An unknown error occurred.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'User denied the request for Geolocation.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'The request to get user location timed out.';
                            break;
                    }
                    setState(prev => ({
                        ...prev,
                        error: errorMessage,
                        isLoading: false
                    }));
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }, []);

    return { ...state, getLocation, getLocationPromise };
};
