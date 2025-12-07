import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Coordinates } from '@thelocals/core/types';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    center: Coordinates;
    zoom?: number;
    isScanning?: boolean;
}

const MapUpdater: React.FC<{ center: Coordinates }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo([center.lat, center.lng], map.getZoom());
    }, [center, map]);
    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ center, zoom = 15, isScanning = false }) => {
    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <Marker position={[center.lat, center.lng]} />

            <MapUpdater center={center} />

            {isScanning && (
                <>
                    <Circle
                        center={[center.lat, center.lng]}
                        pathOptions={{ fillColor: '#0d9488', color: '#0d9488', opacity: 0.2, fillOpacity: 0.1 }}
                        radius={500}
                        className="animate-pulse"
                    />
                    <Circle
                        center={[center.lat, center.lng]}
                        pathOptions={{ fillColor: '#0d9488', color: '#0d9488', opacity: 0.1, fillOpacity: 0.05 }}
                        radius={1000}
                        className="animate-ping"
                    />
                </>
            )}
        </MapContainer>
    );
};
