'use client';
import React, { useState, useCallback, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { GoogleMapProvider, MapMarker, useReverseGeocode, Marker } from '@thelocals/platform-core';

interface AddressEditorProps {
    initialPosition: { lat: number; lng: number };
    initialAddress: string;
    onConfirm: (address: string, lat: number, lng: number) => void;
    onClose: () => void;
}

export const AddressEditor: React.FC<AddressEditorProps> = ({
    initialPosition,
    initialAddress,
    onConfirm,
    onClose
}) => {
    const [position, setPosition] = useState(initialPosition);
    const [displayAddress, setDisplayAddress] = useState(initialAddress);
    const { geocode, loading } = useReverseGeocode();
    const mapRef = useRef<google.maps.Map | null>(null);

    const onDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setPosition({ lat, lng });

            const addr = await geocode(lat, lng);
            if (addr) setDisplayAddress(addr);
        }
    }, [geocode]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm z-10">
                <h2 className="font-bold text-lg">Confirm Location</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                </button>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <GoogleMapProvider
                    center={position}
                    zoom={16}
                    className="h-full w-full"
                    onLoad={onMapLoad}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                >
                    <Marker
                        position={position}
                        draggable={true}
                        onDragEnd={onDragEnd}
                        animation={typeof google !== 'undefined' ? google.maps.Animation.DROP : undefined}
                    />
                </GoogleMapProvider>

                {/* Center Indicator (optional, marker handles it) */}

                {/* Floating Address Card */}
                <div className="absolute bottom-6 left-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-slide-up">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pinned Location</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-4">
                        {loading ? 'Fetching address...' : displayAddress}
                    </p>

                    <button
                        onClick={() => onConfirm(displayAddress, position.lat, position.lng)}
                        disabled={loading}
                        className="w-full bg-lokals-green text-white font-bold py-3 rounded-xl shadow-lg shadow-lokals-green/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        {loading ? 'Scanning...' : (
                            <>
                                <Check size={18} /> Confirm Location
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
