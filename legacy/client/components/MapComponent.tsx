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
        if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
            try {
                map.flyTo([center.lat, center.lng], map.getZoom());
            } catch (e) {
                console.error("Map flyTo error:", e);
            }
        }
    }, [center, map]);
    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ center, zoom = 15, isScanning = false }) => {
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
        console.error("MapComponent received invalid center:", center);
        return <div data-testid="map-error-invalid-center">Invalid Map Center</div>;
    }

    // Hardcoded center for debugging "No location found" crash
    const debugCenter = { lat: 51.505, lng: -0.09 };
    const mapCenter = center || debugCenter;

    return (
        <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <Marker position={[mapCenter.lat, mapCenter.lng]} />

            {/* MapUpdater disabled to rule out flyTo */}
            {/* <MapUpdater center={center} /> */}

            {isScanning && (
                <>
                    <Circle
                        center={[mapCenter.lat, mapCenter.lng]}
                        pathOptions={{ fillColor: '#0d9488', color: '#0d9488', opacity: 0.2, fillOpacity: 0.1 }}
                        radius={500}
                        className="animate-pulse"
                    />
                </>
            )}
        </MapContainer>
    );
    // return <div data-testid="map-placeholder" ...>Map Placeholder</div>;
};
