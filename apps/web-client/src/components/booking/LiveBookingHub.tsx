'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Loader2, Phone, MessageCircle, Star, CreditCard, Wallet, Banknote, CheckCircle } from 'lucide-react';
import { GoogleMapProvider, Marker, liveBookingService, bookingService, notificationService, MAP_STYLES_LOKALS } from '@thelocals/platform-core';
import { useAuth } from '../../contexts/AuthContext';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ServiceCategory, ServiceItem } from '@thelocals/platform-core';

interface LiveBookingHubProps {
    serviceCategory?: ServiceCategory;
    initialServiceItem?: ServiceItem;
}

export default function LiveBookingHub({ serviceCategory, initialServiceItem }: LiveBookingHubProps) {
    const router = useRouter();

    // Initialize with passed props
    const { state, context, send } = useBookingLogic('DRAFT', {
        serviceCategory,
        selectedOption: initialServiceItem,
        price: initialServiceItem ? PricingUtils.calculateEstimate(initialServiceItem).total : 0
    });
    const { user } = useAuth();
    const mapRef = useRef<google.maps.Map | null>(null);

    // Form State (Controlled)
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingTime, setBookingTime] = useState('Now (ASAP)');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'CASH'>('CARD');

    // Derived State
    const isSearching = state === 'SEARCHING' || state === 'REQUESTING';
    const isAssigned = state === 'CONFIRMED' || state === 'EN_ROUTE' || state === 'IN_PROGRESS';
    const isPaymentPending = state === 'PAYMENT_PENDING';
    const isCompleted = state === 'COMPLETED';

    // Initial Center from Context or Default (Mumbai)
    const center = context.location ? { lat: context.location.lat, lng: context.location.lng } : { lat: 19.0760, lng: 72.8777 };

    // Local state for smooth animation (bypassing XState context for high-freq updates)
    const [providerLocation, setProviderLocation] = useState<{ lat: number, lng: number } | null>(null);

    const handleConfirmBooking = async () => {
        if (!user) {
            toast.error("Please login to continue");
            router.push(`/login?redirect=/book?category_id=${serviceCategory?.id || ''}`);
            return;
        }

        if (!context.serviceCategory || !context.location) return;

        try {
            // 1. Find Nearby Providers (Real)
            // Using the real DB seeded data (Indiranagar fallback if needed)
            let providers = await bookingService.findNearbyProviders(
                context.serviceCategory.id,
                context.location.lat,
                context.location.lng,
                10000 // 10km radius
            );

            console.log("Found Providers:", providers);

            // 1b. Strict Fallback - Only if absolutely 0 from DB and we want to demo
            // In Sprint 3, we expect REAL providers.
            if (!providers || providers.length === 0) {
                toast.error("No service providers found in this area.");
                return;
            }

            // Extract IDs
            const providerIds = providers.map(p => p.provider_id);

            // 2. Create Live Booking
            const booking = await liveBookingService.createLiveBooking({
                clientId: user.id,
                serviceId: context.serviceCategory.id,
                requirements: {
                    location: context.location,
                    option: context.selectedOption,
                    date: bookingDate,
                    time: bookingTime,
                    notes: notes,
                    price_locked: context.price // Pass locked price
                }
            });

            // 3. Create Requests for Providers & Notify
            if (providerIds.length > 0) {
                await liveBookingService.createBookingRequests(booking.id, providerIds);

                // 4. Notify Providers (New)
                await notificationService.notifyProviders(
                    providerIds,
                    "New Job Available",
                    `New ${context.serviceCategory.name} request nearby!`,
                    { bookingId: booking.id }
                );
            }

            // 5. Update State to MATCHING
            // Note: We need to align Flow state with this. 'SEARCHING' -> 'BOOKING_CREATED' -> 'PROVIDER_MATCHING'
            // For now, assuming LiveBookingHub still uses simplified local state mapping or we update the Hub state logic too.
            // Let's keep 'SEARCHING' as the UI state for "Matching"
            send('SUBMIT_LIVE', { bookingId: booking.id });

            // 6. Polling/Subscription
            const channel = liveBookingService.subscribeToBookingUpdates(
                booking.id,
                (payload) => {
                    const newData = payload.new as any;
                    if (newData) handleStatusUpdate(newData.status, newData);
                },
                (locationPayload) => {
                    // Update local state for smooth animation
                    if (locationPayload && locationPayload.lat && locationPayload.lng) {
                        setProviderLocation({ lat: locationPayload.lat, lng: locationPayload.lng });
                    }
                }
            );
            mapRef.current = channel as any;

        } catch (error) {
            console.error("Failed to create booking:", error);
            toast.error("Failed to create booking. Please try again.");
        }
    };

    const handleStatusUpdate = (status: string, data: any) => {
        console.log("Received Status Update:", status, data);

        // 1. Searching / Matching (Keep Pulse)
        if (status === 'BOOKING_CREATED' || status === 'PROVIDER_MATCHING') {
            // No state change needed if already in SEARCHING
            // But if we want to be explicit:
            // send('START_MATCHING'); 
            return;
        }

        // 2. Provider Found / Assigned
        if (status === 'PROVIDER_ACCEPTED' || status === 'CONFIRMED' || status === 'ACCEPTED') {
            send('PROVIDER_FOUND', {
                provider: {
                    providerId: data.provider_id || 'mock-id',
                    name: 'Provider', // Ideally fetch full details
                    rating: 4.8,
                    location: { lat: center.lat + 0.001, lng: center.lng + 0.001 },
                    isOnline: true,
                    services: []
                }
            });
        }

        // 3. Request Lifecycle
        else if (status === 'PROVIDER_EN_ROUTE' || status === 'EN_ROUTE') {
            send('PROVIDER_EN_ROUTE');
        } else if (status === 'SERVICE_IN_PROGRESS' || status === 'IN_PROGRESS') {
            send('START_JOB');
        } else if (status === 'SERVICE_COMPLETED' || status === 'COMPLETED') {
            send('COMPLETE_JOB');
        } else if (status === 'PAYMENT_PENDING') {
            // In new flow, COMPLETE_JOB transitions to PAYMENT_PENDING in state machine automatically
            // But if we receive it directly:
            // send('GENERATE_INVOICE');
        } else if (status === 'PAYMENT_SUCCESS') {
            send('PAYMENT_SUCCESS');
        }
    };

    const handleCompleteJob = async () => {
        // DEV ONLY: Client simulating Provider
        if (!context.bookingId || !context.provider?.providerId) {
            toast.error("Missing booking or provider ID");
            return;
        }
        try {
            await liveBookingService.completeBooking(context.bookingId, context.provider.providerId);
            toast.success("Job Completed (Dev)");
        } catch (e) {
            console.error(e);
            toast.error("Failed to complete job");
        }
    };

    const handleProcessPayment = async () => {
        if (!context.bookingId) return;

        toast.loading("Processing Payment...");
        try {
            // Mock Payment Processing
            await liveBookingService.processPayment(context.bookingId, context.price || 499, paymentMethod);

            toast.dismiss();
            toast.success("Payment Successful!");
            // State update will be triggered by Realtime Subscription
        } catch (e) {
            console.error(e);
            toast.dismiss();
            toast.error("Payment failed. Please try again.");
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

    // Layout Variance based on State
    if (state === 'DRAFT' || state === 'ESTIMATING') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header */}
                <div className="bg-white p-4 shadow-sm z-10 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-lg text-gray-900">Confirm Booking</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4">

                    {/* Location Section */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        {/* Location (Editable) */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Service Location</h4>
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <MapPin size={18} className="text-gray-500" />
                                <p className="flex-1 font-medium text-gray-900 text-sm truncate">{context.location?.address || 'Detecting...'}</p>
                            </div>
                            {/* Map Preview */}
                            <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-gray-200 relative pointer-events-none grayscale opacity-80">
                                <GoogleMapProvider
                                    center={center}
                                    zoom={15}
                                    className="h-full w-full"
                                    options={{ disableDefaultUI: true, styles: MAP_STYLES_LOKALS, draggable: false }}
                                >
                                    <Marker position={center} />
                                </GoogleMapProvider>
                            </div>
                        </div>

                        {/* Date & Time Selection */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">When do you need it?</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-lokals-green"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-medium ml-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-lokals-green"
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes / Description */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Instructions / Notes</h4>
                            <textarea
                                placeholder="Describe the issue or provide entry instructions..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-lokals-green h-24 resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Service Details (Order Summary) */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                🛠️
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{context.selectedOption?.name || 'Service'}</h3>
                                <p className="text-sm text-gray-500">{context.selectedOption?.description || 'Standard Service'}</p>
                                <div className="mt-2 text-xl font-bold text-gray-900">
                                    {PricingUtils.formatPrice(context.price || 0)}
                                </div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">What's Included</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-center gap-2">✓ Professional Service</li>
                                <li className="flex items-center gap-2">✓ Post-service cleanup</li>
                                <li className="flex items-center gap-2">✓ 7-day warranty</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={handleConfirmBooking}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-900 transition-all active:scale-95"
                        >
                            Find Provider
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Pending State
    if (isPaymentPending || isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-white p-4 shadow-sm z-10 flex items-center justify-center">
                    <h1 className="font-bold text-lg text-gray-900">Payment</h1>
                </div>

                <div className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        {isCompleted ? <CheckCircle size={40} /> : <CreditCard size={32} />}
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isCompleted ? 'Payment Successful!' : `Total: ${PricingUtils.formatPrice(context.price || 499)}`}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {isCompleted ? 'Your booking has been completed.' : 'Select a payment method to complete the job.'}
                        </p>
                    </div>

                    {!isCompleted && (
                        <div className="w-full space-y-3 mt-8">
                            <div
                                onClick={() => setPaymentMethod('CARD')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-lokals-green bg-green-50' : 'border-gray-200 bg-white'}`}
                            >
                                <CreditCard size={24} className={paymentMethod === 'CARD' ? 'text-lokals-green' : 'text-gray-400'} />
                                <span className="font-bold text-gray-700">Credit / Debit Card</span>
                            </div>

                            <div
                                onClick={() => setPaymentMethod('UPI')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-lokals-green bg-green-50' : 'border-gray-200 bg-white'}`}
                            >
                                <Wallet size={24} className={paymentMethod === 'UPI' ? 'text-lokals-green' : 'text-gray-400'} />
                                <span className="font-bold text-gray-700">UPI (GooglePay / PhonePe)</span>
                            </div>

                            <div
                                onClick={() => setPaymentMethod('CASH')}
                                className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-lokals-green bg-green-50' : 'border-gray-200 bg-white'}`}
                            >
                                <Banknote size={24} className={paymentMethod === 'CASH' ? 'text-lokals-green' : 'text-gray-400'} />
                                <span className="font-bold text-gray-700">Cash on Delivery</span>
                            </div>
                        </div>
                    )}

                    {!isCompleted && (
                        <button
                            onClick={handleProcessPayment}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-gray-800 active:scale-95 transition-all mt-8"
                        >
                            Pay Now
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-screen w-full bg-gray-100 overflow-hidden">
            {/* 1. Full Screen Map Background (Only for Searching/Assigned) */}
            <div className="absolute inset-0 z-0">
                <GoogleMapProvider
                    center={center}
                    zoom={16}
                    className="h-full w-full"
                    options={{ disableDefaultUI: true, styles: MAP_STYLES_LOKALS }}
                    onLoad={(map) => { mapRef.current = map; }}
                >
                    {/* User Location */}
                    <Marker position={center} />

                    {/* Provider Location (if assigned) */}
                    {isAssigned && (context.provider || providerLocation) && (
                        <Marker
                            position={providerLocation || {
                                lat: (context.provider as any)?.location?.lat || 0,
                                lng: (context.provider as any)?.location?.lng || 0
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
                            <div className="w-full space-y-3">
                                <div className="w-full bg-green-100 text-green-800 py-3 rounded-xl text-center font-bold">
                                    Job in Progress
                                </div>
                                <button
                                    onClick={handleCompleteJob}
                                    className="w-full border-2 border-dashed border-gray-300 py-3 rounded-xl font-bold text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
                                >
                                    End Job (Dev)
                                </button>
                            </div>
                        ) : state === 'CONFIRMED' || state === 'EN_ROUTE' ? (
                            <div className="w-full space-y-3">
                                <button
                                    onClick={() => send('START_JOB')}
                                    className="w-full border-2 border-dashed border-gray-300 py-3 rounded-xl font-bold text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
                                >
                                    Start Job (Dev)
                                </button>
                                <button
                                    onClick={() => send('CANCEL')}
                                    className="w-full border-2 border-gray-100 py-3 rounded-xl font-bold text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
