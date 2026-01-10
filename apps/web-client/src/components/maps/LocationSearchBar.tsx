'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Edit, Loader2 } from 'lucide-react';
import { GoogleMapProvider, useCurrentPosition, useReverseGeocode } from '@thelocals/platform-core';
import { AddressEditor } from './AddressEditor';

interface LocationSearchBarProps {
    onLocationSelect?: (address: string, lat: number, lng: number) => void;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ onLocationSelect }) => {
    const { position, error, loading: posLoading } = useCurrentPosition();
    const { address, geocode, loading: geoLoading } = useReverseGeocode();
    const [currentArea, setCurrentArea] = useState('Detecting Location...');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

    // Initial detection
    useEffect(() => {
        if (position) {
            setMapCenter(position);
            geocode(position.lat, position.lng).then(addr => {
                if (addr) setCurrentArea(addr);
            });
            if (onLocationSelect) onLocationSelect(currentArea, position.lat, position.lng);
        } else if (error) {
            setCurrentArea("Mumbai (Default)");
            setMapCenter({ lat: 19.0760, lng: 72.8777 });
        }
    }, [position, error, geocode]);

    const handleConfirmAddress = (newAddr: string, lat: number, lng: number) => {
        setCurrentArea(newAddr);
        setMapCenter({ lat, lng });
        setIsEditorOpen(false);
        if (onLocationSelect) onLocationSelect(newAddr, lat, lng);
    };

    return (
        <>
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-4 z-40 rounded-b-2xl shadow-sm border-b border-gray-100">
                {/* Mini Map Preview */}
                <div className="rounded-xl overflow-hidden h-32 mb-3 shadow-inner relative bg-gray-100 opacity-90">
                    {mapCenter ? (
                        <GoogleMapProvider
                            center={mapCenter}
                            zoom={14}
                            className="h-full w-full pointer-events-none" // Non-interactive preview
                            options={{ disableDefaultUI: true, zoomControl: false }}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2" onClick={() => setIsEditorOpen(true)}>
                    <div className="w-8 h-8 rounded-full bg-lokals-green/10 flex items-center justify-center text-lokals-green flex-shrink-0">
                        <MapPin size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Location</p>
                        <p className="text-sm font-bold text-gray-900 truncate pr-2">
                            {posLoading ? 'Locating...' : currentArea}
                        </p>
                    </div>

                    <button
                        className="p-2 text-gray-400 hover:text-lokals-green hover:bg-gray-50 rounded-full transition-colors"
                        onClick={(e) => { e.stopPropagation(); setIsEditorOpen(true); }}
                    >
                        <Edit size={18} />
                    </button>
                </div>
            </div>

            {isEditorOpen && mapCenter && (
                <AddressEditor
                    initialPosition={mapCenter}
                    initialAddress={currentArea}
                    onConfirm={handleConfirmAddress}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}
        </>
    );
};
