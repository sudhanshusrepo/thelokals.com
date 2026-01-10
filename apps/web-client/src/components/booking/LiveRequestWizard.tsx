'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    adminService,
    bookingService,
    ServiceCategory,
    GoogleMapProvider,
    Marker
} from '@thelocals/platform-core';
import { useBookingFlow } from '../../contexts/BookingContext';
import { useLocation } from '../../contexts/LocationContext';
import { MapPin, ArrowRight, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { AddressEditor } from '../maps/AddressEditor';
import { toast } from 'react-hot-toast';

export const LiveRequestWizard = () => {
    const router = useRouter();
    const [step, setStep] = useState<'service' | 'location' | 'broadcasting'>('service');
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const { bookingState, send } = useBookingFlow();
    const { locationState, updateLocation } = useLocation();

    const [loading, setLoading] = useState(false);
    const [showAddressEditor, setShowAddressEditor] = useState(false);

    // Use cached location or fallback
    const mapPosition = {
        lat: locationState.latitude || 19.0760,
        lng: locationState.longitude || 72.8777
    };
    const displayAddress = locationState.address || "Select Location";

    const handleLocationConfirm = (addr: string, lat: number, lng: number) => {
        updateLocation(lat, lng, addr);
        setShowAddressEditor(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await adminService.getServiceCategories();
            setCategories(cats);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateRequest = async () => {
        if (!selectedCategory || !locationState.address || !locationState.latitude) return;

        setLoading(true);
        try {
            // Hardcoded "user" ID for now
            const userString = localStorage.getItem('sb-persist-auth-v2-key');
            let userId = 'user_123';
            if (userString) {
                const session = JSON.parse(userString);
                if (session?.user?.id) userId = session.user.id;
            }

            const params = {
                clientId: userId,
                serviceCategory: selectedCategory.name,
                serviceCategoryId: selectedCategory.id,
                requirements: { type: 'Live Request', urgecy: 'Immediate' },
                aiChecklist: ['Standard Service'],
                estimatedCost: selectedCategory.base_price || 500,
                location: { lat: locationState.latitude, lng: locationState.longitude! },
                address: { formatted_address: locationState.address, city: locationState.city || 'Mumbai' },
                notes: 'Live request via Wizard',
                deliveryMode: 'LOCAL' as const
            };

            const result = await bookingService.createAIBooking(params);

            toast.success('Broadcasting to providers...');
            router.push(`/live-request/${result.bookingId}`);

        } catch (error) {
            console.error(error);
            toast.error('Failed to create request. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <button
                    onClick={() => step === 'service' ? router.back() : setStep('service')}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="font-bold text-lg">
                    {step === 'service' ? 'What do you need?' : 'Confirm Location'}
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <AnimatePresence mode="wait">
                    {step === 'service' ? (
                        <motion.div
                            key="service"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setStep('location');
                                    }}
                                    className="flex flex-col items-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-lokals-green/50 hover:bg-lokals-green/5 transition-all active:scale-95 text-center gap-3"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl">
                                        {cat.name.includes('Clean') ? '🧹' :
                                            cat.name.includes('Plumb') ? '🔧' :
                                                cat.name.includes('Elect') ? '⚡' :
                                                    cat.name.includes('Paint') ? '🎨' : '🛠️'}
                                    </div>
                                    <span className="font-medium text-gray-900 line-clamp-2">
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="location"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Selected Service Summary */}
                            <div className="bg-lokals-green/10 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                                    ✓
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Service</p>
                                    <p className="font-bold text-lokals-green">{selectedCategory?.name}</p>
                                </div>
                                <button
                                    onClick={() => setStep('service')}
                                    className="ml-auto text-xs font-semibold text-gray-500 underline"
                                >
                                    Change
                                </button>
                            </div>

                            {/* 1. Map / Location Section */}
                            <div className="relative h-48 bg-gray-100 mb-6 rounded-2xl overflow-hidden shadow-inner">
                                <GoogleMapProvider
                                    center={mapPosition}
                                    zoom={16}
                                    className="h-full w-full pointer-events-none"
                                    options={{ disableDefaultUI: true }}
                                >
                                    <Marker position={mapPosition} />
                                </GoogleMapProvider>

                                {/* Location Overlay Card */}
                                <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl shadow-lg flex items-center justify-between pointer-events-auto">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin size={14} className="text-lokals-green" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Location</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {displayAddress}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddressEditor(true)}
                                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-lokals-green transition-colors"
                                    >
                                        <span className="text-xs font-bold">CHANGE</span>
                                    </button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                <p className="font-semibold mb-1 flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Instant Match
                                </p>
                                <p className="opacity-80">
                                    We'll broadcast this request to top-rated {selectedCategory?.name} providers near you immediately.
                                </p>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            {step === 'location' && (
                <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 safe-pb">
                    <button
                        onClick={handleCreateRequest}
                        disabled={loading || !locationState.address}
                        className="w-full py-4 bg-lokals-green text-white font-bold rounded-xl shadow-lg shadow-lokals-green/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" /> Starting Search...
                            </>
                        ) : (
                            <>
                                Find Provider Now <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    <button className="w-full mt-3 py-2 text-sm text-gray-500 font-medium hover:text-gray-800">
                        Schedule for Later
                    </button>
                </div>
            )}

            {/* Address Editor Modal */}
            {showAddressEditor && (
                <AddressEditor
                    initialPosition={mapPosition}
                    initialAddress={displayAddress}
                    onConfirm={handleLocationConfirm}
                    onClose={() => setShowAddressEditor(false)}
                />
            )}
        </div>
    );
};
