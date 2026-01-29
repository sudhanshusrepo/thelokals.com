
import { useEffect, useRef } from 'react';
import { geoService } from '../services/geoService';
import { logger } from '../services/logger';

interface HeartbeatOptions {
    enabled: boolean;
    intervalMs?: number; // Default 30000 (30s)
    onLocationUpdate?: (lat: number, lng: number) => void;
}

/**
 * Hook to keep the provider 'online' by updating their location/heartbeat.
 * Should be used in the main Provider Layout or Maps view.
 */
export function useProviderHeartbeat({ enabled, intervalMs = 30000, onLocationUpdate }: HeartbeatOptions) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const sendHeartbeat = async () => {
            try {
                // Get current position
                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;

                        // Use existing robust RPC which handles geometry & timestamps
                        await geoService.updateLocation(latitude, longitude);

                        if (onLocationUpdate) {
                            onLocationUpdate(latitude, longitude);
                        }
                    }, (error) => {
                        logger.warn('Heartbeat: Failed to get location', error);
                    }, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 5000
                    });
                }
            } catch (err) {
                logger.error('Heartbeat failed', err);
            }
        };

        // Send immediately on mount/enable
        sendHeartbeat();

        // Schedule interval
        intervalRef.current = setInterval(sendHeartbeat, intervalMs);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [enabled, intervalMs]);
}
