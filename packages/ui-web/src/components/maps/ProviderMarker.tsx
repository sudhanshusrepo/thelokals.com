'use client';

import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface ProviderMarkerProps {
    position: { lat: number; lng: number };
    onClick?: () => void;
}

// Cast to any to avoid React 19/18 type mismatches (TS2786)
const AdvancedMarkerComponent = AdvancedMarker as any;
const PinComponent = Pin as any;

export function ProviderMarker({ position, onClick }: ProviderMarkerProps) {
    return (
        <AdvancedMarkerComponent position={position} onClick={onClick}>
            <PinComponent background={'#000000'} borderColor={'#000000'} glyphColor={'#ffffff'} />
        </AdvancedMarkerComponent>
    );
}
