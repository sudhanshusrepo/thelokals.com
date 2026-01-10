import React from 'react';
import { Marker, InfoWindow, Circle } from '@react-google-maps/api';

interface MapMarkerProps {
    position: google.maps.LatLngLiteral;
    title?: string;
    label?: string;
    icon?: string | google.maps.Icon;
    onClick?: () => void;
    children?: React.ReactNode; // For InfoWindow content if passed directly?
}

export const MapMarker: React.FC<MapMarkerProps> = ({ position, title, label, icon, onClick }) => {
    return (
        <Marker
            position={position}
            title={title}
            label={label}
            icon={icon}
            onClick={onClick}
        />
    );
};

// Re-export common types overlay logic if needed
export { Marker, InfoWindow, Circle };
