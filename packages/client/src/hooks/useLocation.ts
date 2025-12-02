import { useState, useEffect } from 'react';

interface LocationState {
    location: { lat: number; lng: number } | null;
    error: string | null;
    loading: boolean;
}

/**
 * Custom hook to get user's GPS location
 */
export const useLocation = (): LocationState => {
    const [state, setState] = useState<LocationState>({
        location: null,
        error: null,
        loading: true
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({
                location: null,
                error: 'Geolocation not supported',
                loading: false
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    error: null,
                    loading: false
                });
            },
            (error) => {
                setState({
                    location: null,
                    error: error.message,
                    loading: false
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, []);

    return state;
};
