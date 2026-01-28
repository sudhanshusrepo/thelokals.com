'use client';

import React, { ReactNode } from 'react';
import { APIProvider, useMap } from '@vis.gl/react-google-maps';

export { useMap as useGoogleMap }; // Aliasing for backward compat if needed, but better to update calls

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

interface GoogleMapProviderProps {
    children: ReactNode;
    // adding optional props to allow overrides if needed
    apiKey?: string;
}

export function GoogleMapProvider({ children, apiKey }: GoogleMapProviderProps) {
    if (!GOOGLE_MAPS_KEY && !apiKey) {
        return <>{children}</>; // Fallback if no key, or handle error
    }

    return (
        <APIProvider apiKey={apiKey || GOOGLE_MAPS_KEY} libraries={['places', 'geometry']}>
            {children}
        </APIProvider>
    );
}
