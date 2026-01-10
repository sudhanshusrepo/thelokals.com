'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService, bookingService, ServiceCategory, useCurrentPosition, useReverseGeocode } from '@thelocals/platform-core';
import { MapPin, ArrowRight, Loader2, Calendar, Clock, ArrowLeft, Car, Bike, Info } from 'lucide-react';
import { AddressEditor } from '../maps/AddressEditor';
import { toast } from 'react-hot-toast';

export const RentalBookingWizard = () => {
    const router = useRouter();
    const [step, setStep] = useState<'service' | 'details' | 'location'>('service');
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const [loading, setLoading] = useState(false);

    // Rental Specifics
    const [rentalDuration, setRentalDuration] = useState('4 hrs');
    const [vehicleType, setVehicleType] = useState('Any');

    // Location State
    const { position } = useCurrentPosition();
    const { address, geocode } = useReverseGeocode();
    const [confirmedAddress, setConfirmedAddress] = useState<string>('');
    const [confirmedLocation, setConfirmedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [showAddressEditor, setShowAddressEditor] = useState(false);

    useEffect(() => {
        loadRentalCategories();
        if (position) {
            setConfirmedLocation(position);
            geocode(position.lat, position.lng).then(addr => {
                if (addr) setConfirmedAddress(addr);
            });
        }
    }, [position]);

    const loadRentalCategories = async () => {
        const allCats = await adminService.getServiceCategories();
        // Filter for rentals (mocking the check for now if DB isn't updated yet, or strictly checking type)
        // Adjust filter logic based on actual data availability 
        const rentalCats = allCats.filter(c => c.type === 'RENTAL' || c.name.toLowerCase().includes('rental'));
        setCategories(rentalCats);
    };

    const handleCreateRequest = async () => {
        if (!selectedCategory || !confirmedLocation || !confirmedAddress) return;

        setLoading(true);
        try {
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
                requirements: {
                    type: 'Rental Request',
                    duration: rentalDuration,
                    vehiclePreference: vehicleType
                },
                aiChecklist: [`Duration: ${rentalDuration}`, `Vehicle: ${vehicleType}`],
                estimatedCost: selectedCategory.base_price || 800,
                location: confirmedLocation,
                address: { formatted_address: confirmedAddress, city: 'Mumbai' },
                notes: `Rental Request: ${rentalDuration}, ${vehicleType}`,
                deliveryMode: 'LOCAL' as const
            };

            const result = await bookingService.createAIBooking(params);

            toast.success('Searching for available rentals...');
            router.push(`/live-request/${result.bookingId}`);

        } catch (error) {
            console.error(error);
            toast.error('Failed to create rental request.');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <button
                    onClick={() => {
                        if (step === 'details') setStep('service');
                        else if (step === 'location') setStep('details');
                        else router.back();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="font-bold text-lg">
                    {step === 'service' ? 'Rental Service' : 'Request Details'}
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
                            {categories.length > 0 ? categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setStep('details');
                                    }}
                                    className="flex flex-col items-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-lokals-green/50 hover:bg-lokals-green/5 transition-all active:scale-95 text-center gap-3"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl text-lokals-green">
                                        {cat.name.toLowerCase().includes('car') ? <Car /> : <Bike />}
                                    </div>
                                    <span className="font-medium text-gray-900 line-clamp-2">
                                        {cat.name}
                                    </span>
                                </button>
                            )) : (
                                <div className="col-span-2 text-center py-10 text-gray-400">
                                    No rental services available in this area yet.
                                </div>
                            )}
                        </motion.div>
                    ) : step === 'details' ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Duration Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 block">How long do you need it?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['4 hrs', '8 hrs', '24 hrs', '2 Days'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setRentalDuration(d)}
                                            className={`py-3 rounded-xl text-sm font-semibold border ${rentalDuration === d ? 'border-lokals-green bg-lokals-green/10 text-lokals-green' : 'border-gray-200 bg-white text-gray-600'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preference */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 block">Vehicle Preference</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Any', 'Economy', 'Premium', 'Electric'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setVehicleType(v)}
                                            className={`py-3 rounded-xl text-sm font-semibold border ${vehicleType === v ? 'border-lokals-green bg-lokals-green/10 text-lokals-green' : 'border-gray-200 bg-white text-gray-600'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('location')}
                                className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl mt-4"
                            >
                                Continue
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="location"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Summary */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-semibold">{selectedCategory?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-semibold">{rentalDuration}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Vehicle</span>
                                    <span className="font-semibold">{vehicleType}</span>
                                </div>
                            </div>

                            {/* Location Confirmation (Same as standard Wizard) */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <MapPin size={18} className="text-lokals-green" />
                                    Pickup Location
                                </h3>

                                <div
                                    onClick={() => setShowAddressEditor(true)}
                                    className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-3 cursor-pointer hover:border-lokals-green transition-colors"
                                >
                                    <div className="flex-1">
                                        {confirmedAddress ? (
                                            <p className="font-medium text-gray-900 line-clamp-2">{confirmedAddress}</p>
                                        ) : (
                                            <p className="text-gray-400 italic">Detecting location...</p>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-lokals-green bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                        Change
                                    </span>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 flex gap-3">
                                <Info size={20} className="flex-shrink-0" />
                                <p className="opacity-90">
                                    Providers will quote based on your requirements. You can chat with them after matching.
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
                        disabled={loading || !confirmedAddress}
                        className="w-full py-4 bg-lokals-green text-white font-bold rounded-xl shadow-lg shadow-lokals-green/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" /> Starting Search...
                            </>
                        ) : (
                            <>
                                Find Rentals <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Address Editor Modal */}
            {showAddressEditor && confirmedLocation && (
                <AddressEditor
                    initialPosition={confirmedLocation}
                    initialAddress={confirmedAddress}
                    onConfirm={(addr, lat, lng) => {
                        setConfirmedAddress(addr);
                        setConfirmedLocation({ lat, lng });
                        setShowAddressEditor(false);
                    }}
                    onClose={() => setShowAddressEditor(false)}
                />
            )}
        </div>
    );
};
