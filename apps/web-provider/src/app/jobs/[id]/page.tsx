'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Navigation, Phone, CheckCircle, Clock } from 'lucide-react';
import { liveBookingService, bookingService, PricingUtils, GoogleMapProvider, Marker, MAP_STYLES_LOKALS, Booking } from '@thelocals/platform-core';
import { toast } from 'react-hot-toast';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    const loadBooking = async () => {
        try {
            // Using liveBookingService which has the new helper
            const { data, error } = await liveBookingService.getBookingById(bookingId);
            if (error) throw error;
            setBooking(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    // Realtime Location Tracking
    useEffect(() => {
        let watchId: number;
        if (isTracking && bookingId) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    liveBookingService.broadcastProviderLocation(bookingId, { lat: latitude, lng: longitude });
                },
                (err) => console.error(err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        }
    }, [isTracking, bookingId]);

    const handleStartMoving = async () => {
        if (!booking) return;
        try {
            await liveBookingService.updateBookingStatus(bookingId, 'EN_ROUTE');
            setIsTracking(true);
            setBooking((prev) => prev ? ({ ...prev, status: 'EN_ROUTE' }) : null);
            toast.success("Client notified: You are on the way!");
        } catch (e) {
            toast.error("Failed to update status");
        }
    };

    const handleStartJob = async () => {
        if (!booking) return;
        try {
            await liveBookingService.updateBookingStatus(bookingId, 'IN_PROGRESS');
            setIsTracking(false); // Stop GPS
            setBooking((prev) => prev ? ({ ...prev, status: 'IN_PROGRESS' }) : null);
            toast.success("Job Started");
        } catch (e) {
            toast.error("Failed to start job");
        }
    };

    const handleCompleteJob = async () => {
        if (!booking || !booking.provider_id) return;
        try {
            const providerId = booking.provider_id;
            await liveBookingService.completeBooking(bookingId, providerId);
            setBooking((prev) => prev ? ({ ...prev, status: 'COMPLETED' }) : null);
            toast.success("Job Completed! Waiting for payment.");
        } catch (e) {
            toast.error("Failed to complete job");
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!booking) return <div className="p-6 text-center">Job not found</div>;

    const requirements = (booking.requirements as any) || {};
    const location = requirements.location || { lat: 12.9716, lng: 77.5946 };

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => router.back()}><ArrowLeft /></button>
                <h1 className="font-bold text-lg">Job #{bookingId.slice(0, 4)}</h1>
                <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {booking.status}
                </span>
            </div>

            {/* Map Preview */}
            <div className="h-48 w-full bg-gray-200 relative">
                <GoogleMapProvider
                    center={{ lat: location.lat, lng: location.lng }}
                    zoom={15}
                    className="h-full w-full"
                    options={{ disableDefaultUI: true, styles: MAP_STYLES_LOKALS }}
                >
                    <Marker position={{ lat: location.lat, lng: location.lng }} />
                </GoogleMapProvider>
            </div>

            <div className="p-4 space-y-6">
                {/* Details */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-xl text-gray-900 mb-1">{requirements.option?.name || 'Service'}</h2>
                    <p className="text-gray-500 text-sm mb-4">{requirements.option?.description}</p>

                    <div className="flex items-start gap-3 py-3 border-t border-gray-50">
                        <MapPin className="text-gray-400 mt-1" size={18} />
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{location.address}</p>
                            <button className="text-blue-600 text-xs font-bold mt-1 flex items-center gap-1">
                                <Navigation size={12} /> Get Directions
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-3 border-t border-gray-50">
                        <div className="flex-1">
                            <p className="text-xs text-gray-400 font-bold uppercase">Income</p>
                            <p className="text-xl font-bold text-gray-900">{PricingUtils.formatPrice(requirements.price_locked)}</p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <Phone size={18} />
                        </button>
                    </div>
                </div>

                {/* Actions based on Status */}
                {booking.status === 'CONFIRMED' && (
                    <button
                        onClick={handleStartMoving}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <Navigation size={20} />
                        Start Moving (Notify Client)
                    </button>
                )}

                {booking.status === 'EN_ROUTE' && (
                    <div className="space-y-3">
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-center text-sm font-medium animate-pulse">
                            📡 Broadcasting Location...
                        </div>
                        <button
                            onClick={handleStartJob}
                            className="w-full bg-lokals-green text-black py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            <Clock size={20} />
                            Arrived & Start Job
                        </button>
                    </div>
                )}

                {booking.status === 'IN_PROGRESS' && (
                    <button
                        onClick={handleCompleteJob}
                        className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Complete Job
                    </button>
                )}

                {booking.status === 'COMPLETED' && (
                    <div className="text-center p-4 bg-green-50 rounded-xl text-green-800 font-bold">
                        Waiting for Payment...
                    </div>
                )}
            </div>
        </div>
    );
}

// Need to ensure updateBookingStatus and getBookingById exist in service/index
