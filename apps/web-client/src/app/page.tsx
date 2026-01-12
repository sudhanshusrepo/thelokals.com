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
import { useLocation } from '../contexts/LocationContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

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


    // Location Context Integration
    const { locationState, setLocation } = useLocation();

    useEffect(() => {
        if (locationState.city) {
            // Check if city matches one of our available cities
            const matchedCity = AVAILABLE_CITIES.find(c => locationState.city?.includes(c));
            if (matchedCity) {
                setSelectedCity(matchedCity);
            }
        }
    }, [locationState.city]);


    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-lokals-yellow/10 via-lokals-green/10 to-blue-50 pb-24">
                <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
                    {/* Header - Replaced with Smart Location Bar */}
                    <LocationSearchBar
                        onLocationSelect={(addr, lat, lng) => {
                            setLocation({
                                address: addr,
                                lat: lat,
                                lng: lng,
                                city: addr.split(',').pop()?.trim() || 'Mumbai' // Simple parse, ideally more robust
                            });
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
                                                    price: cat.base_price || 499,
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

                        {/* Rental Services Section */}
                        <Section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold font-poppins text-gray-900">Rentals & More</h3>
                                <button onClick={() => router.push('/rentals')} className="font-semibold text-lokals-green text-sm hover:underline">See All</button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Hardcoded Entry Point for Rentals for now until DB populated */}
                                <button
                                    onClick={() => router.push('/rentals')}
                                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 items-center text-center hover:border-lokals-green/50 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                                        🚗
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">Car Rental</span>
                                </button>
                                <button
                                    onClick={() => router.push('/rentals')}
                                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 items-center text-center hover:border-lokals-green/50 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-2xl">
                                        🛵
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">Bike Rental</span>
                                </button>
                            </div>
                        </Section>
                    </main>
                </div>
            </div>
        </ErrorBoundary>
    );
}
