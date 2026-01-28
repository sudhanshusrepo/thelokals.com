'use client';
import React from 'react';
import { Marker as GoogleMarker } from '@vis.gl/react-google-maps';

interface MarkerProps {
    position: google.maps.LatLngLiteral;
    title?: string;
    label?: string;
    icon?: string | google.maps.Icon | google.maps.Symbol;
    onClick?: (e: any) => void;
    draggable?: boolean;
    onDragEnd?: (e: any) => void;
    animation?: google.maps.Animation;
    children?: React.ReactNode;
}

export const Marker: React.FC<MarkerProps> = (props) => {
    return (
        <GoogleMarker
            position={props.position}
            draggable={props.draggable}
            onClick={props.onClick}
            onDragEnd={props.onDragEnd}
            icon={props.icon}
            title={props.title}
        />
    );
};

export const InfoWindow: React.FC<any> = () => null;
export const Circle: React.FC<any> = () => null;
export const MapMarker = Marker;

