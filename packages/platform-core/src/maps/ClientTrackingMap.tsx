
'use client';

import React, { useEffect, useState } from 'react';
import { useMap, Marker } from '@vis.gl/react-google-maps';
import { liveBookingService } from '../services/liveBookingService';

interface ClientTrackingMapProps {
    bookingId: string;
    initialProviderLocation?: { lat: number; lng: number };
}

export const ClientTrackingMap: React.FC<ClientTrackingMapProps> = ({ bookingId, initialProviderLocation }) => {
    const map = useMap();
    const [providerLoc, setProviderLoc] = useState<{ lat: number; lng: number } | null>(initialProviderLocation || null);

    useEffect(() => {
        if (!bookingId) return;

        console.log("Subscribing to tracking for:", bookingId);

        const channel = liveBookingService.subscribeToBookingUpdates(
            bookingId,
            (statusPayload) => {
                console.log("Status update:", statusPayload);
                // Handle status changes (e.g. ARRIVED)
            },
            (locationPayload) => {
                // Realtime broadcast payload
                // Expected: { lat, lng, bearing, speed }
                if (locationPayload.lat && locationPayload.lng) {
                    setProviderLoc({ lat: locationPayload.lat, lng: locationPayload.lng });

                    // Optional: Pan map to keep provider in view
                    // if (map) map.panTo({ lat: locationPayload.lat, lng: locationPayload.lng });
                }
            }
        );

        return () => {
            liveBookingService.unsubscribeFromChannel(channel);
        };
    }, [bookingId, map]);

    if (!providerLoc) return null;

    // Ensure Google Maps API is loaded before using 'google' namespace
    if (typeof google === 'undefined') return null;

    return (
        <Marker
            position={providerLoc}
            icon={{
                url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
                scaledSize: new google.maps.Size(32, 32)
            }}
            title="Provider"
        />
    );
};
