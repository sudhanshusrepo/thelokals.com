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
import { Surface, Section, HeroSurface, CardGrid } from '../components/ui/Wrappers';
import { useMyBookings } from '../hooks/useMyBookings';
import { LocationSearchBar } from '../components/maps/LocationSearchBar';

export default function Home() {
    const router = useRouter();
    const { user } = useAuth();
    const { activeBooking } = useMyBookings();

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
        <div className="min-h-screen bg-gradient-to-br from-lokals-yellow/10 via-lokals-green/10 to-blue-50 pb-24">
            <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
                {/* Header - Replaced with Smart Location Bar */}
                <LocationSearchBar
                    onLocationSelect={(addr, lat, lng) => {
                        console.log("Location Selected:", addr, lat, lng);
                        // TODO: Update global user location context if needed
                    }}
                />

                {/* Legacy Header Removed */}

                <main className="flex flex-col gap-6 px-4">
                    {/* Hero Card */}
                    <HeroSurface>
                        <HeroCard
                            title={`Welcome to ${selectedCity}`}
                            subtitle="Best providers, assigned instantly."
                            cta1={{ label: "Book Service", onClick: () => router.push('/services') }}
                            variant="gradient"
                        />
                    </HeroSurface>

                    {/* Sticky Quick Actions */}
                    <section className="sticky top-[80px] z-40 -mx-4 px-4 py-2 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md overflow-x-auto no-scrollbar border-y border-white/20">
                        {loading ? (
                            <div className="flex gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-10 w-24 bg-gray-200/50 rounded-v2-pill animate-pulse flex-shrink-0" />
                                ))}
                            </div>
                        ) : quickActions.length > 0 ? (
                            <div className="flex gap-3 pb-1">
                                {quickActions.map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleSelectCategory(action.id)}
                                        className="px-5 py-2.5 rounded-v2-pill bg-white/80 shadow-sm border border-gray-100 whitespace-nowrap font-medium text-sm text-gray-700 hover:border-lokals-green hover:text-lokals-green hover:shadow-md transition-all active:scale-95"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-neutral-500">No categories found.</div>
                        )}
                    </section>


                    // ...

                    {/* Upcoming Bookings (Active) */}
                    {activeBooking && (
                        <Section>
                            <h3 className="text-lg font-bold font-poppins mb-3 text-gray-900">Upcoming</h3>
                            <Surface elevated className="border-l-4 border-l-lokals-orange">
                                <StatusCard
                                    booking={{
                                        id: activeBooking.id,
                                        serviceName: (activeBooking as any).serviceName || 'Service',
                                        status: activeBooking.status === 'PENDING' ? 'assigned' : (activeBooking.status.toLowerCase() as any),
                                        date: new Date(activeBooking.scheduled_date || activeBooking.created_at).toLocaleDateString(),
                                        time: new Date(activeBooking.scheduled_date || activeBooking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        imageUrl: '/services/ac.jpg'
                                    }}
                                    onClick={() => router.push(`/bookings/${activeBooking.id}`)}
                                />
                            </Surface>
                        </Section>
                    )}

                    {/* Popular Services Grid */}
                    <Section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold font-poppins text-gray-900">Recommended</h3>
                            <button onClick={() => router.push('/services')} className="font-semibold text-lokals-green text-sm hover:underline">See All</button>
                        </div>

                        {loading ? (
                            <CardGrid>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-56 bg-gray-200 rounded-v2-card animate-pulse" />
                                ))}
                            </CardGrid>
                        ) : displayServices.length > 0 ? (
                            <CardGrid>
                                {displayServices.map(cat => (
                                    <Surface key={cat.id} elevated className="!p-0 overflow-hidden group cursor-pointer" onClick={() => handleSelectService(cat.id)}>
                                        <ServiceCard
                                            service={{
                                                id: cat.id,
                                                name: cat.name,
                                                image: '/services/ac.jpg', // Placeholder
                                                price: cat.base_price || 0,
                                                rating: 4.8,
                                                reviews: 120,
                                                isBestMatch: true
                                            }}
                                            onClick={() => { }} // Handled by Surface
                                        />
                                    </Surface>
                                ))}
                            </CardGrid>
                        ) : (
                            <div className="text-center py-12 text-neutral-400 bg-white rounded-v2-card border border-dashed border-gray-200">
                                <div className="text-2xl mb-2">📍</div>
                                No services currently standard in {selectedCity}.
                            </div>
                        )}
                    </Section>
                </main>
            </div>
        </div>
    );
}
