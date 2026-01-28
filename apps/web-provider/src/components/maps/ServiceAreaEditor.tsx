'use client';
import React from 'react';
import { GoogleMapProvider, ProviderCircle, useCurrentPosition } from '@thelocals/platform-core';
import { Map } from '@vis.gl/react-google-maps';

interface ServiceAreaEditorProps {
    center?: { lat: number; lng: number };
    radiusKm: number;
    onRadiusChange: (km: number) => void;
    className?: string;
}

export const ServiceAreaEditor: React.FC<ServiceAreaEditorProps> = ({
    center,
    radiusKm,
    onRadiusChange,
    className
}) => {
    // If center not provided, try to use current position or fallback to Mumbai
    const { position } = useCurrentPosition();
    const mapCenter = center || position || { lat: 19.0760, lng: 72.8777 };

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-sm border border-neutral-100 ${className}`}>
            <GoogleMapProvider>
                <div className="h-full w-full">
                    <Map
                        defaultCenter={mapCenter}
                        defaultZoom={12}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <ProviderCircle
                            center={mapCenter}
                            radiusKm={radiusKm}
                            editable={true}
                            onRadiusChange={onRadiusChange}
                        />
                    </Map>
                </div>
            </GoogleMapProvider>

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold text-neutral-600">
                Service Radius: {radiusKm} km
            </div>
        </div>
    );
};
