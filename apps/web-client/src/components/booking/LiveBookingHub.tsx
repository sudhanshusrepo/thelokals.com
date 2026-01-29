'use client';

import React, { useState } from 'react';
import { ServiceCategory, GoogleMapProvider, ClientTrackingMap } from '@thelocals/platform-core';
import { Map, Marker } from '@vis.gl/react-google-maps';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth, liveBookingService, LiveBooking, useUserLocation } from '@thelocals/platform-core';
import { SearchingRadar } from './SearchingRadar';

interface LiveBookingHubProps {
    serviceCategory: ServiceCategory;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 19.0760,
    lng: 72.8777
};

export default function LiveBookingHub({ serviceCategory }: LiveBookingHubProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { location: userLocation, isLoading: isLocLoading } = useUserLocation();

    // State
    const [step, setStep] = useState<'DRAFT' | 'SEARCHING' | 'CONFIRMED'>('DRAFT');
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

    const [currentBooking, setCurrentBooking] = useState<LiveBooking | null>(null);

    const handleConfirm = async () => {
        if (!user) {
            toast.error("Please login to continue");
            router.push(`/login?redirect=/book?category_id=${serviceCategory.id}`);
            return;
        }

        if (!userLocation) {
            toast.error("Locating you...");
            return;
        }

        try {
            setStep('SEARCHING');

            // 1. Create & Broadcast Booking (Atomic Fan-out)
            const booking = await liveBookingService.createAndBroadcastBooking({
                clientId: user.id,
                serviceId: serviceCategory.id,
                requirements: {
                    location: { lat: userLocation.lat, lng: userLocation.lng },
                    date: bookingDate,
                    address: userLocation.address
                }
            });
            setCurrentBooking(booking);

            // 2. Subscribe to updates
            const channel = liveBookingService.subscribeToBookingUpdates(
                booking.id,
                (payload) => {
                    const newRecord = payload.new as any;
                    // Update local booking state with new data from DB
                    setCurrentBooking((prev) => prev ? { ...prev, ...newRecord } : newRecord);

                    const newStatus = newRecord.status;
                    if (newStatus === 'CONFIRMED' || newStatus === 'EN_ROUTE' || newStatus === 'IN_PROGRESS' || newStatus === 'COMPLETED') {
                        setStep('CONFIRMED');
                    }
                    if (newRecord.payment_status === 'PAID') {
                        toast.success("Payment Confirmed");
                    }
                }
            );

        } catch (error: any) {
            toast.error(error.message || "Failed to start booking");
            setStep('DRAFT');
        }
    };

    const handleCancel = async () => {
        if (!currentBooking) return;
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        try {
            await liveBookingService.cancelBooking(currentBooking.id);
            toast.success("Booking Cancelled");
            setStep('DRAFT');
            setCurrentBooking(null);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel");
        }
    };

    const handleReview = async (rating: number) => {
        if (!currentBooking) return;
        try {
            await liveBookingService.submitReview(currentBooking.id, rating, "Great service!");
            toast.success("Review Submitted!");
            router.push('/bookings');
        } catch (error: any) {
            toast.error("Failed to submit review");
        }
    };

    if (step === 'SEARCHING') {
        return (
            <SearchingRadar
                serviceName={serviceCategory.name}
                onCancel={handleCancel}
            />
        );
    }

    if (step === 'CONFIRMED' && currentBooking) {
        return (
            <div className="h-screen w-full flex flex-col bg-gray-50">
                {/* Live Tracking Map */}
                <div className="flex-1 relative">
                    <GoogleMapProvider>
                        <Map
                            defaultCenter={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : center}
                            defaultZoom={15}
                            disableDefaultUI={true}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <ClientTrackingMap bookingId={currentBooking.id} />
                            {userLocation && <Marker position={{ lat: userLocation.lat, lng: userLocation.lng }} />}
                        </Map>
                    </GoogleMapProvider>
                </div>

                {/* Bottom Sheet Info */}
                {/* Bottom Sheet Info / State Machine */}
                <div className="bg-white p-6 rounded-t-3xl shadow-2xl -mt-6 relative z-10 transition-all duration-300">

                    {/* 1. EN_ROUTE / IN_PROGRESS */}
                    {currentBooking.status !== 'COMPLETED' && currentBooking.status !== 'CANCELLED' && (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                    👷
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {currentBooking.status === 'IN_PROGRESS' ? 'Job In Progress' : 'Provider En Route'}
                                    </h2>
                                    <p className="text-gray-500 text-sm">
                                        {currentBooking.status === 'IN_PROGRESS' ? 'Work has started' : 'Arriving in ~10 mins'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleCancel} className="flex-1 bg-red-50 text-red-600 px-8 py-4 rounded-xl font-bold">
                                    Cancel
                                </button>
                                <button onClick={() => router.push('/bookings')} className="flex-1 bg-black text-white px-8 py-4 rounded-xl font-bold">
                                    Details
                                </button>
                            </div>
                        </>
                    )}

                    {/* 2. PAYMENT (Completed but not Paid) */}
                    {currentBooking.status === 'COMPLETED' && currentBooking.payment_status !== 'PAID' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                ✅
                            </div>
                            <h2 className="text-xl font-bold mb-2">Job Completed!</h2>
                            <p className="text-gray-500 mb-6">Please clear the payment to proceed.</p>

                            <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
                                <div className="flex justify-between mb-2">
                                    <span>Base Price</span>
                                    <span className="font-bold">₹{serviceCategory.base_price || 499}</span>
                                </div>
                                <div className="flex justify-between text-green-600 text-sm">
                                    <span>Discount (New User)</span>
                                    <span>-₹50</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{(serviceCategory.base_price || 499) - 50}</span>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    try {
                                        const amount = (serviceCategory.base_price || 499) - 50;
                                        await liveBookingService.processPayment(currentBooking.id, amount, 'UPI');
                                        toast.success("Payment Successful!");
                                        // The realtime subscription will update local state to PAID
                                    } catch (e) {
                                        toast.error("Payment Failed");
                                    }
                                }}
                                className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold animate-pulse"
                            >
                                Pay Now (UPI)
                            </button>
                        </div>
                    )}

                    {/* 3. REVIEW (Paid but not Reviewed) */}
                    {currentBooking.status === 'COMPLETED' && currentBooking.payment_status === 'PAID' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                                ⭐
                            </div>
                            <h2 className="text-xl font-bold mb-2">Rate your Experience</h2>
                            <p className="text-gray-500 mb-6">How was the service provided?</p>

                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleReview(star)}
                                        className="text-4xl hover:scale-110 transition-transform"
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">Click a star to submit</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Map Header */}
            <div className="h-1/3 w-full relative">
                <GoogleMapProvider>
                    <Map
                        defaultCenter={center}
                        defaultZoom={15}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Marker position={center} />
                    </Map>
                </GoogleMapProvider>

                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg text-gray-700"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Config Panel */}
            <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 p-6 shadow-2xl overflow-y-auto">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{serviceCategory.name}</h1>
                <p className="text-gray-500 mb-6">{serviceCategory.description}</p>

                <div className="space-y-6">
                    {/* Location */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                        <MapPin className="text-lokals-red" size={20} />
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                            <p className="font-bold text-gray-900 line-clamp-1">Mumbai, Maharashtra (Detected)</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                        <Clock className="text-lokals-yellow" size={20} />
                        <div className="w-full">
                            <p className="text-xs text-gray-400 font-bold uppercase">Schedule</p>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="bg-transparent font-bold text-gray-900 w-full outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Total Estimate</p>
                        <p className="text-2xl font-bold text-gray-900">₹{serviceCategory.base_price || 499}</p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
