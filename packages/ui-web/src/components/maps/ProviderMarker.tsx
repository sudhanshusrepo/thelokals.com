import React, { useEffect, useState } from 'react';

interface ProviderMarkerProps {
    position: { lat: number; lng: number };
    onClick?: () => void;
    map?: google.maps.Map; // Injected by parent
}

export function ProviderMarker({ position, onClick, map }: ProviderMarkerProps) {
    useEffect(() => {
        if (!map || !window.google) return;

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            // Content can be customized here if needed
        });

        if (onClick) {
            marker.addEventListener('gmp-click', onClick);
        }

        return () => {
            marker.map = null;
        };
    }, [map, position]);

    return null;
}
