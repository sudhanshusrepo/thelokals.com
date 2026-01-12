import React, { useEffect, useState } from 'react';
import { useGoogleMap } from './GoogleMapProvider';

// Compatible Interfaces
interface MarkerProps {
    position: google.maps.LatLngLiteral;
    title?: string;
    label?: string;
    icon?: string | google.maps.Icon | google.maps.Symbol;
    onClick?: () => void;
    draggable?: boolean;
    onDragEnd?: (e: google.maps.MapMouseEvent) => void;
    animation?: google.maps.Animation;
    children?: React.ReactNode;
}

export const Marker: React.FC<MarkerProps> = ({ position, title, label, icon, onClick, draggable, onDragEnd, animation }) => {
    const map = useGoogleMap();
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);

    useEffect(() => {
        if (!map) return;

        const m = new google.maps.Marker({
            position,
            map,
            title,
            label,
            icon,
            draggable,
            animation
        });

        if (onClick) {
            m.addListener("click", onClick);
        }

        if (onDragEnd) {
            m.addListener("dragend", onDragEnd);
        }

        setMarker(m);

        return () => {
            if (m) m.setMap(null);
        };
    }, [map]); // Re-create if map changes (simple)

    // Update position effectively
    useEffect(() => {
        if (marker && position) {
            marker.setPosition(position);
        }
    }, [position, marker]);

    // Icon update
    useEffect(() => {
        if (marker && icon) {
            marker.setIcon(icon);
        }
    }, [icon, marker]);


    return null; // Markers don't render DOM elements here
};

// Mock InfoWindow and Circle for now if unused, or implement similarly
export const InfoWindow: React.FC<any> = () => null;
export const Circle: React.FC<any> = () => null;


interface MapMarkerProps extends MarkerProps { }

export const MapMarker: React.FC<MapMarkerProps> = (props) => {
    return <Marker {...props} />;
};

