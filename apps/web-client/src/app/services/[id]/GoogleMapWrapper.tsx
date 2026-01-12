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
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        scaledSize: { width: 40, height: 40 } as any
                    }}
                />
            ))}
        </GoogleMapProvider>
    );
}
