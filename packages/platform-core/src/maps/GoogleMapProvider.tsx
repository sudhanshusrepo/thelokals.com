'use client';
import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { MAP_STYLES_LOKALS } from './mapStyles';
import { MapSkeleton } from './MapSkeleton';
import { MapError } from './MapError';

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
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const _onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        if (onLoad) onLoad(map);
    }, [onLoad]);

    const onUnmount = useCallback((map: google.maps.Map) => {
        setMap(null);
    }, []);

    const defaultStyle = style || { height: '400px' };

    if (loadError) {
        return (
            <MapError
                className={className}
                style={defaultStyle}
                message={loadError.message}
            />
        );
    }

    if (!isLoaded) {
        return (
            <MapSkeleton
                className={className}
                style={defaultStyle}
            />
        );
    }

    return (
        <div className={className} style={{ position: 'relative', width: '100%', ...style }}>
            <GoogleMap
                mapContainerStyle={containerStyleDefault}
                center={center}
                zoom={zoom}
                onLoad={_onLoad}
                onUnmount={onUnmount}
                onClick={onClick}
                options={{
                    styles: MAP_STYLES_LOKALS,
                    disableDefaultUI: true,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    ...options
                }}
            >
                {children}
            </GoogleMap>
        </div>
    );
};
