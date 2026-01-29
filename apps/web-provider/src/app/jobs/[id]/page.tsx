'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Navigation, Phone, CheckCircle, Clock } from 'lucide-react';
import { liveBookingService, bookingService, PricingUtils, GoogleMapProvider, Marker, MAP_STYLES_LOKALS, Booking } from '@thelocals/platform-core';
import { Map } from '@vis.gl/react-google-maps';
import { toast } from 'react-hot-toast';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth(); // Import useAuth
    const { acceptBooking, isLoading: isAccepting } = useAcceptBooking(); // Import useAcceptBooking
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        loadBooking();

        // Subscribe to latest status (to catch 'Taken' state)
        const channel = liveBookingService.subscribeToBookingUpdates(bookingId, (payload) => {
            if (payload.new) {
                setBooking(payload.new as Booking);
            }
        });

        return () => { liveBookingService.unsubscribeFromChannel(channel); };
    }, [bookingId]);

    const loadBooking = async () => {
        try {
            const { data, error } = await liveBookingService.getBookingById(bookingId);
            if (error) throw error;
            setBooking(data);
        } catch (error) {
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    // Realtime Location Tracking (Force enabled if EN_ROUTE)
    useEffect(() => {
        let watchId: number;
        // Logic: specific tracking mode OR if active job requires it
        const shouldTrack = isTracking || (booking?.status === 'EN_ROUTE');

        if (shouldTrack && bookingId) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    liveBookingService.broadcastProviderLocation(bookingId, { lat: latitude, lng: longitude });
                },
                (err) => { console.warn("GPS Error", err); },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        }
    }, [isTracking, bookingId, booking?.status]);

    const handleAccept = async () => {
        if (!user || !booking) return;
        const res = await acceptBooking(booking.id, user.id);
        if (res?.success) {
            toast.success("Job Accepted! Head to the location.");
            // Status update comes via realtime, but strictly set it here too for UI snap
            setBooking(prev => prev ? ({ ...prev, status: 'CONFIRMED', provider_id: user.id }) : null);
        } else {
            // Handled by hook error/toast, usually "Job Taken"
            router.push('/dashboard');
        }
    };

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
            setIsTracking(false);
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

    // Derived UI State
    // Derived UI State
    const isJobTaken = booking.status !== 'PENDING' && booking.status !== 'CANCELLED' && booking.provider_id !== user?.id;
    const isMyJob = booking.provider_id === user?.id;
    const isCancelled = booking.status === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="p-6 text-center flex flex-col items-center justify-center h-screen bg-white">
                <div className="text-red-500 mb-4 text-4xl">❌</div>
                <h2 className="text-xl font-bold mb-2">Booking Cancelled</h2>
                <p className="text-gray-500 mb-6">
                    {(booking as any).cancellation_reason || "The client has cancelled this request."}
                </p>
                <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-6 py-3 rounded-xl font-bold">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (isJobTaken) {
        return (
            <div className="p-6 text-center flex flex-col items-center justify-center h-screen bg-white">
                <div className="text-gray-400 mb-4 text-4xl">🔒</div>
                <h2 className="text-xl font-bold mb-2">Job Taken</h2>
                <p className="text-gray-500 mb-6">This job has been accepted by another provider.</p>
                <button onClick={() => router.push('/dashboard')} className="bg-gray-100 px-6 py-3 rounded-xl font-bold">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => router.back()}><ArrowLeft /></button>
                <h1 className="font-bold text-lg">Job #{bookingId.slice(0, 4)}</h1>
                <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {booking.status === 'PENDING' ? 'NEW REQUEST' : booking.status}
                </span>
            </div>

            {/* Map Preview */}
            <div className="h-48 w-full bg-gray-200 relative">
                <GoogleMapProvider>
                    <Map
                        defaultCenter={{ lat: location.lat, lng: location.lng }}
                        defaultZoom={15}
                        gestureHandling={'none'}
                        disableDefaultUI={true}
                        style={{ width: '100%', height: '100%' }}
                        styles={MAP_STYLES_LOKALS}
                    >
                        <Marker position={{ lat: location.lat, lng: location.lng }} />
                    </Map>
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
                            <p className="text-xl font-bold text-gray-900">{PricingUtils.formatPrice(requirements.price_locked || requirements.price)}</p>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <Phone size={18} />
                        </button>
                    </div>
                </div>

                {/* Actions based on Status */}
                {booking.status === 'PENDING' && (
                    <div className="space-y-3">
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm font-medium mb-2 border border-yellow-100">
                            ⚡ Fast Booking: Accept quickly before others!
                        </div>
                        <button
                            onClick={handleAccept}
                            disabled={isAccepting}
                            className="w-full bg-lokals-red text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {isAccepting ? 'Accepting...' : 'Accept Job'}
                        </button>
                        <button className="w-full bg-white text-gray-500 py-3 rounded-xl font-medium border border-gray-200">
                            Reject
                        </button>
                    </div>
                )}

                {booking.status === 'CONFIRMED' && isMyJob && (
                    <button
                        onClick={handleStartMoving}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <Navigation size={20} />
                        Start Moving (Notify Client)
                    </button>
                )}

                {booking.status === 'EN_ROUTE' && isMyJob && (
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

                {booking.status === 'IN_PROGRESS' && isMyJob && (
                    <button
                        onClick={handleCompleteJob}
                        className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Complete Job
                    </button>
                )}

                {booking.status === 'COMPLETED' && isMyJob && (
                    <div className="space-y-4">
                        {booking.payment_status === 'PAID' ? (
                            <div className="text-center p-6 bg-green-100 rounded-xl text-green-900 border border-green-200">
                                <div className="text-4xl mb-2">💰</div>
                                <h3 className="font-bold text-lg">Payment Received</h3>
                                <p className="text-sm opacity-75">You earned ₹{PricingUtils.formatPrice(requirements.price_locked || requirements.price)}</p>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="mt-4 w-full bg-white text-green-700 py-3 rounded-lg font-bold shadow-sm"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-yellow-50 rounded-xl text-yellow-800 border border-yellow-200">
                                <h3 className="font-bold">Waiting for Payment...</h3>
                                <p className="text-sm opacity-75">Client is processing the payment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


