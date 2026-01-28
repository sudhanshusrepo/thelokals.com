
'use client';

import React, { useMemo, useState } from 'react';
import { useUserLocation, GoogleMapProvider, LocationSelector, LocationPermissionModal, useGeoFilteredServices } from '@thelocals/platform-core';
import Link from 'next/link';

// Mapping codes to display names (placeholder until we have a better way)
const SERVICE_MAP: Record<string, string> = {
    'PLUMBING': 'Plumbing',
    'CLEANING': 'Home Cleaning',
    'ELECTRICIAN': 'Electrician',
    'PAINTING': 'Painting'
};

function ServiceCard({ service, pincode, enabled }: { service: any, pincode: string, enabled: boolean }) {
    return (
        <Link href={`/services/${service.code.toLowerCase()}`}
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-100"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                    {/* Icons based on code */}
                    {service.code === 'PLUMBING' && '🔧'}
                    {service.code === 'CLEANING' && '🧹'}
                    {service.code === 'ELECTRICIAN' && '⚡'}
                    {service.code === 'PAINTING' && '🎨'}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {enabled ? 'Available' : 'Unavailable'}
                </span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-gray-500">
                {enabled ? `Serving in ${pincode}` : 'Not available in this area'}
            </p>
        </Link>
    );
}

export default function ServicesPage() {
    return (
        <GoogleMapProvider>
            <ServicesPageContent />
        </GoogleMapProvider>
    );
}

function ServicesPageContent() {
    // 1. Get Location
    const { location, isLoading: locationLoading, permissionGranted } = useUserLocation();

    // 2. Local state for manual override (if user drags map)
    const [selectedAddress, setSelectedAddress] = useState(location);

    // Update selected address when auto-detection finishes
    React.useEffect(() => {
        if (location) {
            setSelectedAddress(location);
        }
    }, [location]);

    // 3. Query Worker for availability
    // We use the selectedAddress (manual) or fell back to location
    const activeLocation = selectedAddress || location;
    const servicesQuery = useGeoFilteredServices(activeLocation);

    // 4. Filter enabled services
    const enabledServices = useMemo(() => {
        if (!servicesQuery) return [];
        return servicesQuery
            .map((q: any, i: number) => {
                // Determine code from index since we know the order in hook
                const codes = ['PLUMBING', 'CLEANING', 'ELECTRICIAN', 'PAINTING'];
                return {
                    code: codes[i],
                    enabled: q.data?.is_enabled,
                    name: SERVICE_MAP[codes[i]]
                };
            })
            // .filter(s => s.enabled) // Ideally filter, but for demo we might want to show disabled too? 
            // The prompt said "Render ONLY enabled services", so let's filter:
            .filter(s => s.enabled);
    }, [servicesQuery]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Find Services Near You</h1>
                        <p className="text-gray-500 mt-1">
                            {activeLocation?.address
                                ? `Showing results for ${activeLocation.pincode}`
                                : 'Detecting your location...'}
                        </p>
                    </div>
                </div>

                {/* Location Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <LocationSelector
                                location={activeLocation}
                                onChange={setSelectedAddress}
                                showMap={true}
                            />
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className="lg:col-span-2">
                        {locationLoading && !activeLocation ? (
                            <div className="text-center py-12 text-gray-500">Finding your location...</div>
                        ) : (
                            <>
                                {enabledServices.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {enabledServices.map(service => (
                                            <ServiceCard
                                                key={service.code}
                                                service={service}
                                                pincode={activeLocation?.pincode || ''}
                                                enabled={true}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-8 rounded-xl text-center shadow-sm">
                                        <div className="text-4xl mb-4">📍</div>
                                        <h3 className="text-lg font-bold text-gray-900">No services found here</h3>
                                        <p className="text-gray-500 mt-2">
                                            We are not serving <b>{activeLocation?.pincode}</b> yet.
                                            Try moving the map marker to a different location.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Permission Modal */}
                <LocationPermissionModal
                    onGrant={() => {
                        // Permissions are tricky to "trigger" again via JS if denied/prompted, 
                        // but usually running getCurrentPosition triggers it.
                        // The hook does this on mount if not granted. 
                        // A reload is a brute force way to re-trigger the prompt flow 
                        // if the browser suppressed it.
                        window.location.reload();
                    }}
                    open={!permissionGranted && !location && !locationLoading}
                />

            </div>
        </div>
    );
}
