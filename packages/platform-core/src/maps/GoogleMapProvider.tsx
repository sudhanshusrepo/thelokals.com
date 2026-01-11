'use client';
import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { MAP_STYLES_LOKALS } from './mapStyles';
import { CONFIG } from '../config';

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
    return (
        <React.Fragment>
            <LoadScript googleMapsApiKey={CONFIG.GOOGLE_MAPS_KEY}>
                <GoogleMap
                    mapContainerStyle={style || containerStyleDefault}
                    mapContainerClassName={className}
                    center={center}
                    zoom={zoom}
                    onLoad={onLoad}
                    onUnmount={() => { }}
                    onClick={onClick}
                    options={{
                        styles: MAP_STYLES_LOKALS,
                        disableDefaultUI: true,
                        gestureHandling: 'greedy',
                        ...options
                    }}
                >
                    {children}
                </GoogleMap>
            </LoadScript>
        </React.Fragment>
    );
};
