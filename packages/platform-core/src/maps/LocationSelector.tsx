'use client';

import React, { useRef, useState } from 'react';
import { UserLocation } from './types/map';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

interface LocationSelectorProps {
    location: UserLocation | undefined;
    onChange: (loc: UserLocation) => void;
    showMap?: boolean;
}

function extractPincode(addressComponents: any[]): string {
    const postalCode = addressComponents?.find(
        (c: any) => c.types.includes('postal_code')
    );
    return postalCode ? postalCode.long_name : '';
}

export function LocationSelector({ location, onChange, showMap }: LocationSelectorProps) {
    const [searchValue, setSearchValue] = useState(location?.address || '');
    // APIProvider in parent handles loading. We can use useMap to see if map is ready but simplified here.

    // We need 'geocoding' service. useMapsLibrary can fetch it.
    const geocodingLib = useMapsLibrary('geocoding');
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

    React.useEffect(() => {
        if (geocodingLib) {
            setGeocoder(new geocodingLib.Geocoder());
        }
    }, [geocodingLib]);

    const onMapClick = async (e: any) => {
        // e.detail.latLng in new lib? or check event structure.
        // Vis.gl map onClick event has 'detail' with latLng.
        if (!e.detail.latLng || !geocoder) return;

        const newLat = e.detail.latLng.lat;
        const newLng = e.detail.latLng.lng;

        try {
            const result = await geocoder.geocode({ location: { lat: newLat, lng: newLng } });

            if (result.results && result.results[0]) {
                const pincode = extractPincode(result.results[0]?.address_components);
                const address = result.results[0]?.formatted_address;
                setSearchValue(address);
                onChange({ lat: newLat, lng: newLng, pincode, address, accuracy: 0 });
            }
        } catch (err) {
            console.error('Failed to resolve address on map click', err);
        }
    };

    const handleAddressSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h3 className="font-medium text-gray-700">Service Location</h3>
            </div>

            {showMap && location && (
                <div className="mb-4 overflow-hidden rounded-lg h-[300px]">
                    <Map
                        defaultCenter={{ lat: location.lat, lng: location.lng }}
                        defaultZoom={15}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        onClick={onMapClick}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Marker position={{ lat: location.lat, lng: location.lng }} draggable={true} onDragEnd={onMapClick} />
                    </Map>
                </div>
            )}

            <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={searchValue}
                placeholder="Enter pincode or address"
                onChange={handleAddressSearch}
            />
        </div>
    );
}
