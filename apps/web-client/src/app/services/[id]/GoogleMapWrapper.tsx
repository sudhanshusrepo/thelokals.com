'use client';

import { GoogleMapProvider, Marker } from '@thelocals/platform-core';

// Simulated random offsets for "Pros Nearby"
const getRandomOffset = () => (Math.random() - 0.5) * 0.04;

export function GoogleMapWrapper() {
    // Default to Gurugram center
    const center = { lat: 28.4595, lng: 77.0266 };

    return (
        <GoogleMapProvider
            center={center}
            zoom={13}
            className="w-full h-full"
            options={{
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {/* Simulate 3-5 pros nearby */}
            {[1, 2, 3, 4].map(i => (
                <Marker
                    key={i}
                    position={{
                        lat: center.lat + getRandomOffset(),
                        lng: center.lng + getRandomOffset()
                    }}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#00C853',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#ffffff',
                    }}
                />
            ))}
        </GoogleMapProvider>
    );
}
