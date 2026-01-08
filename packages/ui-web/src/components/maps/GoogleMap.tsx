'use client';

import React from 'react';
import { APIProvider, Map, MapProps } from '@vis.gl/react-google-maps';

interface GoogleMapProps extends MapProps {
    apiKey: string;
    className?: string;
    children?: React.ReactNode;
}

// Cast to any to avoid React 19/18 type mismatches (TS2786)
const APIProviderComponent = APIProvider as any;
const MapComponent = Map as any;

export function GoogleMap({ apiKey, className, children, ...props }: GoogleMapProps) {
    return (
        <APIProviderComponent apiKey={apiKey}>
            <div className={className || "w-full h-full"}>
                <MapComponent
                    {...props}
                    defaultCenter={props.defaultCenter || { lat: 28.4595, lng: 77.0266 }} // Gurugram
                    defaultZoom={props.defaultZoom || 12}
                    gestureHandling={'cooperative'}
                    disableDefaultUI={true}
                    mapId={props.mapId || "bf51a910020fa25a"} // Custom Styling ID (optional)
                >
                    {children}
                </MapComponent>
            </div>
        </APIProviderComponent>
    );
}
