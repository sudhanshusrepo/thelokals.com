
import { useEffect, useRef, useState } from 'react';
import { liveBookingService } from '../services/liveBookingService';
import { logger } from '../services/logger';

interface TrackingOptions {
    bookingId: string | null;
    enabled: boolean;
    throttleMs?: number; // Default 3000ms
}

/**
 * Hook to broadcast live location during an active booking.
 * Uses high-accuracy GPS and WebSocket broadcast.
 */
export function useLiveTracking({ bookingId, enabled, throttleMs = 3000 }: TrackingOptions) {
    const [isTracking, setIsTracking] = useState(false);
    const watchIdRef = useRef<number | null>(null);
    const lastSentRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled || !bookingId) {
            stopTracking();
            return;
        }

        startTracking();

        return () => {
            stopTracking();
        };
    }, [bookingId, enabled]);

    const startTracking = () => {
        if (!('geolocation' in navigator)) {
            logger.warn('Geolocation not supported');
            return;
        }

        setIsTracking(true);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                if (now - lastSentRef.current > throttleMs) {
                    const { latitude, longitude, heading, speed } = position.coords;

                    // Broadcast via Realtime Channel
                    liveBookingService.broadcastProviderLocation(bookingId!, {
                        lat: latitude,
                        lng: longitude
                    }).catch(err => {
                        console.error('Failed to broadcast location', err);
                    });

                    // Update timestamp
                    lastSentRef.current = now;
                }
            },
            (error) => {
                logger.error('Error watching position', error);
            },
            options
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
    };

    return { isTracking };
}
