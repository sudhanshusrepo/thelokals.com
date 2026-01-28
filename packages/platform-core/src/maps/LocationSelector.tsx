
'use client';

import React, { useRef, useState } from 'react';
import { UserLocation } from './types/map';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

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
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_KEY
    });

    const onMapClick = async (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();

        try {
            // Reverse geocode
            const geoRes = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${GOOGLE_MAPS_KEY}`
            );
            const geoData = await geoRes.json();

            if (geoData.results && geoData.results[0]) {
                const pincode = extractPincode(geoData.results[0]?.address_components);
                const address = geoData.results[0]?.formatted_address;
                setSearchValue(address);
                onChange({ lat: newLat, lng: newLng, pincode, address, accuracy: 0 });
            }
        } catch (err) {
            console.error('Failed to resolve address on map click', err);
        }
    };

    const handleAddressSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        // Implementation of Places Autocomplete would go here typically
    };

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h3 className="font-medium text-gray-700">Service Location</h3>
                {/* <button className="text-sm text-blue-600 hover:underline" onClick={() => refetchLocation()}>Detect My Location</button> */}
            </div>

            {showMap && isLoaded && location && (
                <div className="mb-4 overflow-hidden rounded-lg">
                    <GoogleMap
                        mapContainerStyle={{ height: '300px', width: '100%' }}
                        center={{ lat: location.lat, lng: location.lng }}
                        zoom={15}
                        onClick={onMapClick}
                        options={{
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                        }}
                    >
                        <Marker position={{ lat: location.lat, lng: location.lng }} draggable={true} onDragEnd={onMapClick} />
                    </GoogleMap>
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
