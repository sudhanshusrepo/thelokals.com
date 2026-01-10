import React, { useCallback, useRef } from 'react';
import { Circle, Marker } from '@react-google-maps/api';

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
    const circleRef = useRef<google.maps.Circle | null>(null);

    const onLoad = useCallback((circle: google.maps.Circle) => {
        circleRef.current = circle;
    }, []);

    const onRadiusChanged = useCallback(() => {
        if (circleRef.current && onRadiusChange) {
            const newRadius = circleRef.current.getRadius();
            const newRadiusKm = Math.round((newRadius / 1000) * 10) / 10; // Keep 1 decimal
            onRadiusChange(newRadiusKm);
        }
    }, [onRadiusChange]);

    // If center changes, logic to update circle center if needed?
    // Google Maps Circle prop `center` handles this automatically.

    return (
        <>
            <Marker position={center} title="Your Location" />
            <Circle
                center={center}
                radius={radiusKm * 1000} // Convert to meters
                onLoad={onLoad}
                editable={editable}
                draggable={false} // Only radius editable preferably
                options={{
                    fillColor: fillColor,
                    fillOpacity: 0.2,
                    strokeColor: strokeColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                }}
                onRadiusChanged={onRadiusChanged}
            />
        </>
    );
};
