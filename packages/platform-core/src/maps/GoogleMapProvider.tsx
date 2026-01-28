
'use client';

import React, { ReactNode } from 'react';
import { useJsApiLoader, useGoogleMap } from '@react-google-maps/api';

export { useGoogleMap };

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
const LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry'];

interface GoogleMapProviderProps {
    children: ReactNode;
}

export function GoogleMapProvider({ children }: GoogleMapProviderProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_KEY,
        libraries: LIBRARIES
    });

    if (loadError) {
        return <div>Map cannot be loaded right now, sorry.</div>;
    }

    // We don't block rendering on isLoaded because child components (LocationSelector) use useJsApiLoader internally/redundantly safely 
    // OR we can block if we want to ensure maps is ready globally.
    // For now, we render children as they might be doing other things (loading skeleton)
    return <>{children}</>;
}
