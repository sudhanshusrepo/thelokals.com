'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { MAP_STYLES_LOKALS } from './mapStyles';

const GoogleMapContext = createContext<google.maps.Map | null>(null);

export const useGoogleMap = () => useContext(GoogleMapContext);

const containerStyleDefault = { width: '100%', height: '100%' };
const centerDefault = { lat: 19.0760, lng: 72.8777 }; // Mumbai

interface MapProviderProps {
    center?: google.maps.LatLngLiteral;
    zoom?: number;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onLoad?: (map: google.maps.Map) => void;
    options?: google.maps.MapOptions;
}

export const GoogleMapProvider: React.FC<MapProviderProps> = ({
    center = centerDefault,
    zoom = 13,
    children,
    className,
    style,
    onClick,
    onLoad,
    options
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;
        if (typeof google === 'undefined') return;

        if (!map) {
            const mapInstance = new google.maps.Map(mapRef.current, {
                center,
                zoom,
                styles: MAP_STYLES_LOKALS,
                disableDefaultUI: true,
                gestureHandling: 'greedy',
                ...options
            });

            setMap(mapInstance);
            if (onLoad) onLoad(mapInstance);

            if (onClick) {
                mapInstance.addListener("click", onClick);
            }
        }
    }, [mapRef, map, onLoad, onClick, options]);

    // Update Props
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [center, map]);

    useEffect(() => {
        if (map && zoom) {
            map.setZoom(zoom);
        }
    }, [zoom, map]);

    return (
        <GoogleMapContext.Provider value={map}>
            <div
                ref={mapRef}
                style={style || containerStyleDefault}
                className={className}
            >
                {/* Map is rendered in this div */}
            </div>
            {/* Children rendered within context but outside map div DOM (React Portal style or just Context access) */}
            {map && children}
        </GoogleMapContext.Provider>
    );
};

