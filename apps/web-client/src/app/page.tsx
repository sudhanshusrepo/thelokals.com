'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { HeroCard } from '../components/v2/HeroCard';
import { ServiceCard } from '../components/v2/ServiceCard';
import { StatusCard } from '../components/v2/StatusCard';
import { designTokensV2 } from '../theme/design-tokens-v2';
import { adminService } from '@thelocals/platform-core/services/adminService';
import { ServiceCategory, ServiceLocation, AVAILABLE_CITIES, CITY_COORDINATES } from '@thelocals/platform-core';
import { MapPin, ChevronDown, Search } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const { user } = useAuth();

    const [selectedCity, setSelectedCity] = useState<string>(AVAILABLE_CITIES[0]);

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

    // Filter logic
    const enabledCategoryIds = new Set(
        locations.filter(l => l.is_active).map(l => l.service_category_id)
    );

    const visibleServices = categories.filter(cat => enabledCategoryIds.has(cat.id));
    const displayServices = visibleServices.length > 0 ? visibleServices : [];

    const quickActions = displayServices.slice(0, 5).map(cat => ({
        id: cat.id,
        label: cat.name,
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
        // Uses CITY_COORDINATES from platform-core

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    let minBody = Infinity;
                    let measuredCity = AVAILABLE_CITIES[0]; // Default

                    for (const city of AVAILABLE_CITIES) {
                        const coords = CITY_COORDINATES[city];
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
        <div style={{ minHeight: '100vh', backgroundColor: designTokensV2.colors.background.primary, paddingBottom: '90px' }}>
            {/* V2 Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm px-6 py-4 flex justify-between items-center transition-all duration-300">
                {/* Left: Location */}
                <div className="flex items-center gap-3">
                    <div>
                        <div className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">Current Location</div>
                        <div className="flex items-center gap-1 group cursor-pointer relative">
                            <MapPin size={16} className="text-v2-text-primary" />
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="appearance-none bg-transparent font-bold text-sm text-neutral-900 border-none outline-none cursor-pointer pr-4 z-10"
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
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                        <Search size={22} className="text-gray-700" />
                    </button>
                    {user ? (
                        <div onClick={() => router.push('/profile')} className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden cursor-pointer border-2 border-transparent hover:border-v2-gradient-end transition-all">
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/auth')}
                            className="bg-v2-text-primary text-white text-sm font-bold px-5 py-2.5 rounded-v2-btn shadow-v2-elevated hover:bg-black/90 transition-transform active:scale-95"
                        >
                            Login
                        </button>
                    )}
                </div>
            </header>

            <main className="px-6 py-6 flex flex-col gap-8">
                {/* Hero Card */}
                <section>
                    <HeroCard
                        title={`Welcome to ${selectedCity}`}
                        subtitle="Best providers, assigned instantly."
                        cta1={{ label: "Book Service", onClick: () => router.push('/services') }}
                        variant="gradient"
                    />
                </section>

                {/* Sticky Quick Actions */}
                <section className="sticky top-[76px] z-40 -mx-6 px-6 py-2 bg-v2-bg/95 backdrop-blur-sm overflow-x-auto no-scrollbar">
                    {loading ? (
                        <div className="flex gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-24 bg-gray-200 rounded-v2-pill animate-pulse flex-shrink-0" />
                            ))}
                        </div>
                    ) : quickActions.length > 0 ? (
                        <div className="flex gap-3 pb-2">
                            {quickActions.map(action => (
                                <button
                                    key={action.id}
                                    onClick={() => handleSelectCategory(action.id)}
                                    className="px-5 py-2.5 rounded-v2-pill bg-white shadow-v2-sm whitespace-nowrap font-medium text-sm text-v2-text-primary border border-transparent hover:border-v2-gradient-start hover:shadow-md transition-all active:scale-95"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-neutral-500">No categories found.</div>
                    )}
                </section>

                {/* Upcoming Bookings (Active) */}
                {user && (
                    <section>
                        <h3 className="text-lg font-bold font-poppins mb-4 text-v2-text-primary">Upcoming</h3>
                        {/* Mock Booking Data for Demo - In prod fetch from useBooking */}
                        <StatusCard
                            booking={{
                                id: '123',
                                serviceName: 'Deep Cleaning (3 BHK)',
                                status: 'assigned',
                                date: 'Today, 2:30 PM',
                                time: '2:30 PM',
                                imageUrl: '/services/ac.jpg' // Placeholder
                            }}
                            onClick={() => router.push('/bookings/123')}
                        />
                    </section>
                )}

                {/* Popular Services Grid */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold font-poppins text-v2-text-primary">Recommended</h3>
                        <button onClick={() => router.push('/services')} className="font-semibold text-v2-accent-danger text-sm hover:underline">See All</button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-56 bg-gray-200 rounded-v2-card animate-pulse" />
                            ))}
                        </div>
                    ) : displayServices.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {displayServices.map(cat => (
                                <ServiceCard
                                    key={cat.id}
                                    service={{
                                        id: cat.id,
                                        name: cat.name,
                                        image: '/services/ac.jpg', // Placeholder
                                        price: cat.base_price || 0,
                                        rating: 4.8,
                                        reviews: 120,
                                        isBestMatch: true
                                    }}
                                    onClick={handleSelectService}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-neutral-400 bg-white rounded-v2-card border border-dashed border-gray-200">
                            <div className="text-2xl mb-2">📍</div>
                            No services currently standard in {selectedCity}.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
