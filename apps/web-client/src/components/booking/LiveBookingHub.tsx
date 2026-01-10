'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Loader2, Phone, MessageCircle, Star } from 'lucide-react';
import { GoogleMapProvider, Marker, liveBookingService, bookingService } from '@thelocals/platform-core';
import { useAuth } from '../../contexts/AuthContext';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LiveBookingHub() {
    const router = useRouter();
    const { state, context, send } = useBookingLogic();
    const { user } = useAuth();
    const mapRef = useRef<google.maps.Map | null>(null);

    // Derived State
    const isSearching = state === 'SEARCHING' || state === 'REQUESTING';
    const isAssigned = state === 'CONFIRMED' || state === 'EN_ROUTE' || state === 'IN_PROGRESS';

    // Initial Center from Context or Default (Mumbai)
    const center = context.location ? { lat: context.location.lat, lng: context.location.lng } : { lat: 19.0760, lng: 72.8777 };

    const handleConfirmBooking = async () => {
        if (!context.serviceCategory || !context.location) return;

        try {
            // 1. Find Nearby Providers
            const providers = await bookingService.findNearbyProviders(
                context.serviceCategory.id,
                context.location.lat,
                context.location.lng,
                10000 // 10km
            );

            if (!providers || providers.length === 0) {
                toast.error("No providers found nearby. Please try again later.");
                return;
            }

            // 2. Create Live Booking
            const booking = await liveBookingService.createLiveBooking({
                clientId: user?.id || 'anon_user',
                serviceId: context.serviceCategory.id,
                requirements: {
                    location: context.location,
                    option: context.selectedOption
                }
            });

            // 3. Create Requests for Providers
            const providerIds = providers.map(p => p.id);
            await liveBookingService.createBookingRequests(booking.id, providerIds);

            // 4. Set State to SEARCHING
            send('SUBMIT_LIVE', { bookingId: booking.id });

            // 5. Subscribe to Updates
            const channel = liveBookingService.subscribeToBookingUpdates(booking.id, (payload) => {
                const newData = payload.new as any;
                if (!newData) return;

                if (newData.status === 'CONFIRMED' || newData.status === 'ACCEPTED') {
                    // Update Provider Info
                    send('PROVIDER_FOUND', {
                        provider: {
                            providerId: newData.provider_id,
                            name: 'Provider', // We could fetch real name here
                            rating: 4.8,
                            location: { lat: center.lat + 0.001, lng: center.lng + 0.001 },
                            isOnline: true,
                            services: [] // Added missing property
                        }
                    });
                }
            });

            // Cleanup subscription on unmount or state change handled by effect if needed
            mapRef.current = channel as any;

        } catch (error) {
            console.error("Failed to create booking:", error);
            toast.error("Failed to not create booking. Please try again.");
            // send('FAIL'); 
        }
    };

    // Cleanup channel on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current && (mapRef.current as any).unsubscribe) {
                (mapRef.current as any).unsubscribe();
            }
        }
    }, []);

    return (
        <div className="relative h-screen w-full bg-gray-100 overflow-hidden">
            {/* 1. Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
                <GoogleMapProvider
                    center={center}
                    zoom={16}
                    className="h-full w-full"
                    options={{ disableDefaultUI: true, styles: mapStyles }}
                    onLoad={(map) => { mapRef.current = map; }}
                >
                    {/* User Location */}
                    <Marker position={center} />

                    {/* Provider Location (if assigned) */}
                    {isAssigned && context.provider && (
                        <Marker
                            position={{
                                lat: (context.provider as any).location.lat,
                                lng: (context.provider as any).location.lng
                            }}
                            icon={{ url: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png', scaledSize: { width: 40, height: 40 } as any }}
                        />
                    )}
                </GoogleMapProvider>
            </div>

            {/* 2. Top Navigation (Floating) */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* 3. Interface Layers */}
            <AnimatePresence mode="wait">

                {/* STATE: PRE-BOOKING (Confirm) */}
                {(state === 'DRAFT' || state === 'ESTIMATING') && (
                    <motion.div
                        initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-20 pb-10"
                    >
                        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

                        <div className="flex gap-4 mb-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                                🛠️
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{context.selectedOption?.name || 'Service'}</h3>
                                <div className="text-gray-500 text-sm flex items-center gap-1">
                                    <MapPin size={12} /> {context.location?.address}
                                </div>
                                <div className="mt-2 text-xl font-bold text-gray-900">
                                    {PricingUtils.formatPrice(context.price || 0)}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-900 transition-all active:scale-95"
                        >
                            Find Provider
                        </button>
                    </motion.div>
                )}

                {/* STATE: SEARCHING */}
                {isSearching && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                    >
                        <div className="w-32 h-32 relative mb-8 flex items-center justify-center">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="absolute border-4 border-lokals-green rounded-full"
                                    initial={{ width: '100%', height: '100%', opacity: 0.5 }}
                                    animate={{
                                        width: ['100%', '300%'],
                                        height: ['100%', '300%'],
                                        opacity: [0.5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.6,
                                        ease: "easeOut"
                                    }}
                                />
                            ))}
                            <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center shadow-xl z-10 w-full h-full">
                                <Loader2 size={48} className="text-lokals-green animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Finding nearby pros...</h2>
                        <p className="text-white/80">Connecting with the best rated providers in your area.</p>

                        <button
                            onClick={() => send('CANCEL')}
                            className="mt-8 px-6 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-medium hover:bg-white/20"
                        >
                            Cancel Request
                        </button>
                    </motion.div>
                )}

                {/* STATE: ASSIGNED */}
                {isAssigned && context.provider && (
                    <motion.div
                        initial={{ y: 200 }} animate={{ y: 0 }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-20 pb-10"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-lokals-green uppercase tracking-wider mb-1">Provider Assigned</p>
                                <h2 className="text-xl font-bold text-gray-900">provider is on the way</h2>
                                <p className="text-gray-500 text-sm">Arriving in {context.eta || 12} mins</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-xl font-bold text-gray-900">4282</p>
                                <p className="text-xs text-gray-400">PIN Code</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl mb-6">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                                👨‍🔧
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{context.provider.name || 'Provider'}</h3>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                    <span>{context.provider.rating} Rating</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-blue-600 hover:bg-blue-50">
                                    <MessageCircle size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-green-600 hover:bg-green-50">
                                    <Phone size={18} />
                                </button>
                            </div>
                        </div>

                        {state === 'IN_PROGRESS' ? (
                            <div className="w-full bg-green-100 text-green-800 py-3 rounded-xl text-center font-bold">
                                Job in Progress
                            </div>
                        ) : (
                            <button
                                onClick={() => send('CANCEL')}
                                className="w-full border-2 border-gray-100 py-3 rounded-xl font-bold text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors"
                            >
                                Cancel Booking
                            </button>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}

const mapStyles = [
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#747474" }]
    },
    {
        "featureType": "poi.business",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#e9e9e9" }]
    }
];
