'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { HeroCard } from '../components/v2/HeroCard';
import { ServiceCard } from '../components/v2/ServiceCard';
import { designTokensV2 } from '../theme/design-tokens-v2';
import { adminService } from '@thelocals/core/services/adminService';
import { ServiceCategory, ServiceLocation } from '@thelocals/core/types';
import { MapPin, ChevronDown } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const { user } = useAuth();

    // Available Cities (Should match Admin)
    const AVAILABLE_CITIES = ['Gurugram', 'New Delhi', 'Navi Mumbai', 'Bangalore'];
    const [selectedCity, setSelectedCity] = useState('Gurugram');

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [locations, setLocations] = useState<ServiceLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedCity]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, locs] = await Promise.all([
                adminService.getServiceCategories(),
                adminService.getServiceLocations(selectedCity)
            ]);
            setCategories(cats);
            setLocations(locs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic: Only show categories that have an explicit ENABLED entry in service_locations for the selected city
    const enabledCategoryIds = new Set(
        locations.filter(l => l.is_active).map(l => l.service_category_id)
    );

    const visibleServices = categories.filter(cat => enabledCategoryIds.has(cat.id));

    // Fallback if no services are enabled yet (so homepage isn't empty during dev)
    // In strict production, this would be empty.
    const displayServices = visibleServices.length > 0 ? visibleServices : [];

    const quickActions = displayServices.slice(0, 5).map(cat => ({
        id: cat.id,
        label: cat.name,
        color: '#2196F3' // Default color for now
    }));

    const handleSelectCategory = (categoryId: string) => {
        router.push(`/services/${categoryId}`);
    };

    const handleSelectService = (serviceId: string) => {
        router.push(`/services/${serviceId}`);
    };

    // Geolocation Logic
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    useEffect(() => {
        // City Coordinates (Approximate for detection)
        const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
            'Gurugram': { lat: 28.4595, lng: 77.0266 },
            'New Delhi': { lat: 28.6139, lng: 77.2090 },
            'Navi Mumbai': { lat: 19.0330, lng: 73.0297 },
            'Bangalore': { lat: 12.9716, lng: 77.5946 }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    let minBody = Infinity;
                    let measuredCity = 'Gurugram'; // Default

                    for (const city of AVAILABLE_CITIES) {
                        const coords = CITY_COORDS[city];
                        if (coords) {
                            const dist = calculateDistance(latitude, longitude, coords.lat, coords.lng);
                            if (dist < minBody) {
                                minBody = dist;
                                measuredCity = city;
                            }
                        }
                    }

                    // If user is reasonably close to a supported city (e.g. < 50km), switch to it. 
                    // Or just switch to nearest regardless.
                    if (minBody < 50) {
                        setSelectedCity(measuredCity);
                    }
                },
                (error) => {
                    console.log('Location permission denied or error', error);
                }
            );
        }
    }, []);


    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', paddingBottom: '80px' }}>
            {/* V2 Header */}
            <header style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
                {/* Left: Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>Current Location</div>
                        <div className="flex items-center gap-1 group cursor-pointer relative">
                            <MapPin size={14} className="text-primary" />
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="appearance-none bg-transparent font-bold text-sm text-neutral-900 border-none outline-none cursor-pointer pr-4 z-10"
                                style={{ fontWeight: 600, fontSize: '14px' }}
                            >
                                {AVAILABLE_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Right: User & Bell */}
                <div className="flex items-center gap-4">
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        🔔
                    </button>
                    {user ? (
                        <div onClick={() => router.push('/profile')} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' }}>
                            {/* Avatar Placeholder */}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/auth')}
                            className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:bg-primary-600 transition-colors"
                        >
                            Login
                        </button>
                    )}
                </div>
            </header>

            <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Hero Card */}
                <section>
                    <HeroCard
                        title={`Services in ${selectedCity}`}
                        subtitle="Book verified professionals instantly."
                        cta1={{ label: "View All", onClick: () => router.push('/services') }}
                        variant="gradient"
                    />
                </section>

                {/* Quick Actions - Horizontal Scroll */}
                <section>
                    {quickActions.length > 0 ? (
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            overflowX: 'auto',
                            paddingBottom: '8px',
                            scrollbarWidth: 'none'
                        }}>
                            {quickActions.map(action => (
                                <button
                                    key={action.id}
                                    onClick={() => handleSelectCategory(action.id)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        background: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-neutral-500 text-center py-4 bg-white rounded-lg border border-dashed">
                            No services available in {selectedCity} yet.
                        </div>
                    )}
                </section>

                {/* Upcoming / Status Placeholder */}
                <section>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Upcoming</h3>
                    {/* Empty state */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>No active bookings</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Book your first service today!</p>
                        <button
                            onClick={() => router.push('/services')}
                            style={{
                                background: designTokensV2.colors.gradient.css,
                                border: 'none',
                                padding: '8px 24px',
                                borderRadius: '20px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Book Now
                        </button>
                    </div>
                </section>

                {/* Popular Services Grid */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Available in {selectedCity}</h3>
                        <button onClick={() => router.push('/services')} style={{ border: 'none', background: 'none', color: designTokensV2.colors.accent.danger, fontWeight: 600, cursor: 'pointer' }}>See All</button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-neutral-400">Loading services...</div>
                    ) : displayServices.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px'
                        }}>
                            {displayServices.map(cat => (
                                <ServiceCard
                                    key={cat.id}
                                    service={{
                                        id: cat.id,
                                        name: cat.name,
                                        image: '/services/ac.jpg', // Placeholder
                                        price: cat.base_price || 0, // Should be fetched properly
                                        rating: 4.8,
                                        reviews: 0,
                                    }}
                                    onClick={handleSelectService}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-neutral-400 bg-neutral-50 rounded-xl">
                            <div>🚫</div>
                            No services currently enabled for {selectedCity}.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
