'use client';

import { GoogleMap, ProviderMarker } from '@thelocals/ui-web';

// Simulated random offsets for "Pros Nearby"
const getRandomOffset = () => (Math.random() - 0.5) * 0.04;

export function GoogleMapWrapper() {
    // Default to Gurugram center
    const center = { lat: 28.4595, lng: 77.0266 };
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

    if (!apiKey) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                <span className="text-gray-400 font-bold mb-2">Map Unavailable</span>
                <span className="text-xs text-gray-500">API Key not configured.</span>
            </div>
        );
    }

    return (
        <GoogleMap apiKey={apiKey} defaultCenter={center} defaultZoom={13} className="w-full h-full">
            {/* Simulate 3-5 pros nearby */}
            {[1, 2, 3, 4].map(i => (
                <ProviderMarker
                    key={i}
                    position={{
                        lat: center.lat + getRandomOffset(),
                        lng: center.lng + getRandomOffset()
                    }}
                />
            ))}
        </GoogleMap>
    );
}
