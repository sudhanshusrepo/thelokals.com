import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '../../core/types';
import L from 'leaflet';

// Fix Leaflet/Vite icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LiveTrackerProps {
    providerLocation: Coordinates;
    providerName: string;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ providerLocation, providerName }) => {
    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} className="shadow-lg border border-slate-200">
            <MapContainer
                center={[providerLocation.lat, providerLocation.lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[providerLocation.lat, providerLocation.lng]}>
                    <Popup>
                        <div className="text-center font-bold">
                            🚚 {providerName} <br />
                            <span className="text-xs text-green-600">On the way</span>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};
