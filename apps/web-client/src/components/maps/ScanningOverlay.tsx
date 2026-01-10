'use client';
import React, { useEffect, useState } from 'react';
import { Circle, Marker } from '@thelocals/platform-core';

interface ScanningOverlayProps {
    center: google.maps.LatLngLiteral;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ center }) => {
    const [radius, setRadius] = useState(0);
    const [providers, setProviders] = useState<google.maps.LatLngLiteral[]>([]);

    // Pulse Animation
    useEffect(() => {
        const interval = setInterval(() => {
            setRadius(r => (r > 5000 ? 0 : r + 100)); // Expand to 5km then reset
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Simulate random providers appearing
    useEffect(() => {
        const mocks = Array.from({ length: 5 }).map(() => ({
            lat: center.lat + (Math.random() - 0.5) * 0.04,
            lng: center.lng + (Math.random() - 0.5) * 0.04,
        }));
        setProviders(mocks);
    }, [center]);

    return (
        <>
            {/* Pulsing Circle */}
            <Circle
                center={center}
                radius={radius}
                options={{
                    fillColor: "#FFC107", // Amber
                    fillOpacity: 0.1,
                    strokeColor: "#FFC107",
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    clickable: false,
                }}
            />

            {/* Client Marker */}
            <Marker
                position={center}
                icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#3B82F6",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                }}
            />

            {/* Simulated Nearby Providers */}
            {providers.map((pos, i) => (
                <Marker
                    key={i}
                    position={pos}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        fillColor: "#9CA3AF", // Gray
                        fillOpacity: 0.8,
                        strokeColor: "white",
                        strokeWeight: 1,
                    }}
                />
            ))}
        </>
    );
};
