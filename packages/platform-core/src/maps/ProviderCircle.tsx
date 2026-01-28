'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMap, useMapsLibrary, Marker as GoogleMarker } from '@vis.gl/react-google-maps';

interface ProviderCircleProps {
    center: google.maps.LatLngLiteral;
    radiusKm: number;
    editable?: boolean;
    onRadiusChange?: (newRadiusKm: number) => void;
    fillColor?: string;
    strokeColor?: string;
}

export const ProviderCircle: React.FC<ProviderCircleProps> = ({
    center,
    radiusKm,
    editable = false,
    onRadiusChange,
    fillColor = "#22CC88", // Lokals Green
    strokeColor = "#119966"
}) => {
    const map = useMap();
    const mapsLib = useMapsLibrary('maps');
    const [circle, setCircle] = useState<google.maps.Circle | null>(null);

    // Create circle
    useEffect(() => {
        if (!map || !mapsLib) return;

        const c = new mapsLib.Circle({
            map,
            center,
            radius: radiusKm * 1000,
            editable,
            draggable: false,
            fillColor,
            fillOpacity: 0.2,
            strokeColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
        });

        setCircle(c);

        return () => {
            c.setMap(null);
        };
    }, [map, mapsLib]);

    // Update props
    useEffect(() => {
        if (!circle) return;
        circle.setCenter(center);
        circle.setRadius(radiusKm * 1000);
        circle.setEditable(editable);
        circle.setOptions({
            fillColor,
            strokeColor
        });
    }, [circle, center, radiusKm, editable, fillColor, strokeColor]);

    // Events
    useEffect(() => {
        if (!circle || !onRadiusChange) return;

        const listener = circle.addListener('radius_changed', () => {
            const newRadius = circle.getRadius();
            const newRadiusKm = Math.round((newRadius / 1000) * 10) / 10;
            onRadiusChange(newRadiusKm);
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [circle, onRadiusChange]);

    return (
        <GoogleMarker position={center} title="Your Location" />
    );
};
