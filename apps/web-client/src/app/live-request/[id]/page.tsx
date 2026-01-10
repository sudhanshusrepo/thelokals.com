'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, liveBookingService, GoogleMapProvider, useCurrentPosition } from '@thelocals/platform-core';
import { ScanningOverlay } from '../../../components/maps/ScanningOverlay';
import { LiveTracker } from '@thelocals/platform-core';
import { ArrowLeft, Eye, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { OTPVerification } from '../../../components/booking/OTPVerification';

interface RequestStatus {
    id: string;
    status: 'broadcasting' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
    viewerCount: number;
    provider?: {
        id: string;
        name: string;
        phone: string;
        rating: number;
        photoUrl?: string;
    };
    service: {
        name: string;
        variant: 'basic' | 'med' | 'full';
        price: number;
    };
    location: string;
    details?: string;
    createdAt: string;
}

export default function LiveRequestPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params?.id as string;

    const [requestStatus, setRequestStatus] = useState<RequestStatus>({
        id: requestId,
        status: 'broadcasting',
        viewerCount: 0,
        service: {
            name: 'AC Repair & Service',
            variant: 'med',
            price: 550,
        },
        location: 'Narnaund, Haryana',
        createdAt: new Date().toISOString(),
    });

    const [providerAccepted, setProviderAccepted] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');

    // Realtime connection
    useEffect(() => {
        if (!requestId) return;

        // Fetch initial state
        const fetchBooking = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*, providers(*)')
                    .eq('id', requestId)
                    .single();

                if (data) {
                    const mappedStatus =
                        data.status === 'PENDING' ? 'broadcasting' :
                            data.status === 'CONFIRMED' ? 'accepted' :
                                data.status === 'IN_PROGRESS' ? 'in_progress' :
                                    data.status === 'COMPLETED' ? 'completed' : 'cancelled';

                    setRequestStatus(prev => ({
                        ...prev,
                        status: mappedStatus as any,
                        provider: data.providers ? {
                            id: data.providers.id,
                            name: data.providers.full_name,
                            phone: data.providers.phone || '',
                            rating: data.providers.rating_average || 0,
                            photoUrl: data.providers.avatar_url
                        } : undefined,
                        details: data.notes || (data.requirements ? JSON.stringify(data.requirements) : undefined)
                    }));

                    if (data.status === 'CONFIRMED' || data.status === 'EN_ROUTE') {
                        setProviderAccepted(true);
                        fetchOTP();
                    }
                }
            } catch (err) {
                console.error('Error fetching booking:', err);
            }
        };

        fetchBooking();

        // Fetch OTP if applicable
        const fetchOTP = async () => {
            const { data } = await supabase
                .from('booking_otp')
                .select('otp_code')
                .eq('booking_id', requestId)
                .maybeSingle();

            if (data?.otp_code) {
                setOtp(data.otp_code);
                setShowOTP(true);
            }
        };

        const channel = liveBookingService.subscribeToBookingUpdates(requestId, (payload) => {
            const newData = payload.new as any;
            if (!newData) return;

            console.log('Realtime update:', newData);

            if (newData.status === 'CONFIRMED') {
                setRequestStatus(prev => ({ ...prev, status: 'accepted' }));
                setProviderAccepted(true);
                toast.success('Provider accepted your request!');
                fetchBooking();
                fetchOTP();
            } else if (newData.status === 'EN_ROUTE') {
                setRequestStatus(prev => ({ ...prev, status: 'en_route' }));
                toast.success('Provider is on the way!');
                fetchOTP();
            } else if (newData.status === 'IN_PROGRESS') {
                setRequestStatus(prev => ({ ...prev, status: 'in_progress' }));
                toast.success('Service started!');
            } else if (newData.status === 'COMPLETED') {
                setRequestStatus(prev => ({ ...prev, status: 'completed' }));
                toast.success('Service completed!');
                setTimeout(() => router.push(`/rating/${requestId}`), 2000);
            }
        });

        return () => {
            liveBookingService.unsubscribeFromChannel(channel);
        };
    }, [requestId]);

    const getStatusColor = () => {
        switch (requestStatus.status) {
            case 'broadcasting':
                return 'text-accent-amber';
            case 'accepted':
                return 'text-success';
            case 'en_route':
                return 'text-primary';
            case 'in_progress':
                return 'text-primary';
            case 'completed':
                return 'text-success';
            case 'cancelled':
                return 'text-error';
            default:
                return 'text-muted';
        }
    };

    const getStatusText = () => {
        switch (requestStatus.status) {
            case 'broadcasting':
                return 'Broadcasting to providers...';
            case 'accepted':
                return 'Provider accepted!';
            case 'en_route':
                return 'Provider is on the way';
            case 'in_progress':
                return 'Service in progress';
            case 'completed':
                return 'Service completed';
            case 'cancelled':
                return 'Request cancelled';
            default:
                return 'Unknown status';
        }
    };

    const { position } = useCurrentPosition();
    const mapCenter = position || { lat: 19.0760, lng: 72.8777 }; // Default Mumbai

    // Mock Provider Location for Tracking (Offset from user)
    const providerLocation = {
        lat: mapCenter.lat + 0.015,
        lng: mapCenter.lng + 0.01
    };

    return (
        <div className="h-screen w-full relative md:flex overflow-hidden bg-neutral-50">

            {/* Map Layer: Absolute on Mobile, Flex on Desktop (Right Side) */}
            <div className="absolute inset-0 z-0 md:relative md:flex-1 md:inset-auto md:order-2 h-full w-full">
                <GoogleMapProvider center={mapCenter} zoom={14} className="h-full w-full">
                    {requestStatus.status === 'broadcasting' ? (
                        <ScanningOverlay center={mapCenter} />
                    ) : (
                        requestStatus.provider && (
                            <LiveTracker from={providerLocation} to={mapCenter} showEta={true} />
                        )
                    )}
                </GoogleMapProvider>
            </div>

            {/* Content Layer: Overlay on Mobile, Sidebar on Desktop (Left Side) */}
            <div className="absolute inset-0 z-10 pointer-events-none md:pointer-events-auto md:relative md:inset-auto md:w-[450px] md:min-w-[450px] md:z-20 md:bg-white md:border-r md:border-neutral-200 md:h-full md:flex md:flex-col md:order-1">

                {/* Header */}
                <header className="pointer-events-auto bg-white/80 backdrop-blur-md md:bg-white border-b border-neutral-200/50 shadow-sm sticky top-0 z-50">
                    <div className="px-4 py-4 md:px-6 flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-foreground" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Live Request</h1>
                            <p className="text-sm text-neutral-500">Request #{requestId?.slice(0, 8)}</p>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="p-4 md:p-6 pointer-events-auto overflow-y-auto h-full pb-20 md:pb-6">
                    <AnimatePresence mode="wait">
                        {requestStatus.status === 'broadcasting' && (
                            <motion.div
                                key="broadcasting"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-8"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-amber/10 to-warning/10 border-2 border-accent-amber/30 p-8 bg-white/90 md:bg-white shadow-sm">
                                    {/* Animated background pulse */}
                                    <div className="absolute inset-0 bg-accent-amber/5 animate-pulse-slow" />

                                    <div className="relative z-10 text-center">
                                        {/* Broadcasting Icon */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                            className="inline-block mb-4"
                                        >
                                            <div className="w-20 h-20 bg-accent-amber rounded-full flex items-center justify-center shadow-lg">
                                                <Eye size={40} className="text-secondary" />
                                            </div>
                                        </motion.div>

                                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                            Broadcasting Your Request
                                        </h2>

                                        {/* Viewer Count */}
                                        <div className="flex items-center justify-center gap-2 text-xl font-semibold text-accent-amber mb-4">
                                            <Eye size={24} />
                                            <motion.span
                                                key={requestStatus.viewerCount}
                                                initial={{ scale: 1.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {requestStatus.viewerCount}
                                            </motion.span>
                                            <span>providers viewing</span>
                                        </div>

                                        <p className="text-neutral-500 max-w-md mx-auto text-sm md:text-base">
                                            Your request is being broadcast to nearby providers. You'll be notified when someone accepts.
                                        </p>

                                        {/* Loading Animation */}
                                        <div className="mt-6 flex justify-center gap-2">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        scale: [1, 1.5, 1],
                                                        opacity: [0.5, 1, 0.5],
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        delay: i * 0.2,
                                                    }}
                                                    className="w-3 h-3 bg-accent-amber rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Provider Accepted */}
                        {(requestStatus.status === 'accepted' || requestStatus.status === 'en_route') && requestStatus.provider && (
                            <motion.div
                                key="accepted"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-8"
                            >
                                {/* Burst Animation */}
                                {providerAccepted && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 1 }}
                                        animate={{ scale: 3, opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                                    >
                                        <div className="w-40 h-40 bg-success rounded-full blur-3xl" />
                                    </motion.div>
                                )}

                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success/10 to-primary/10 border-2 border-success p-8 bg-white/90 md:bg-white shadow-sm">
                                    <div className="text-center mb-6">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', duration: 0.6 }}
                                            className="inline-block mb-4"
                                        >
                                            <CheckCircle2 size={64} className="text-success" />
                                        </motion.div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                            Provider Accepted!
                                        </h2>
                                        <p className="text-neutral-500">
                                            {requestStatus.provider.name} will arrive shortly
                                        </p>
                                    </div>

                                    {/* Provider Details */}
                                    <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                                {requestStatus.provider.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-bold text-foreground truncate">
                                                    {requestStatus.provider.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                    <span>⭐ {requestStatus.provider.rating}</span>
                                                    <span>•</span>
                                                    <span>{requestStatus.provider.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 p-3 rounded-lg">
                                            <Clock size={16} />
                                            <span>Estimated arrival: 15-20 minutes</span>
                                        </div>
                                    </div>

                                    {/* OTP Verification (shown when provider arrives) */}
                                    <div className="mt-6">
                                        <OTPVerification
                                            otp={otp}
                                            providerName={requestStatus.provider.name}
                                            isVerified={false} // Verification happens on Provider side
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Request Details */}
                    <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-4">Request Details</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-neutral-500 mb-1">Service</p>
                                <p className="text-lg font-semibold text-foreground">
                                    {requestStatus.service.name}
                                </p>
                                <p className="text-sm text-neutral-500 capitalize">
                                    {requestStatus.service.variant} variant • ₹{requestStatus.service.price}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-neutral-500 mb-1">Location</p>
                                <p className="text-foreground">{requestStatus.location}</p>
                            </div>

                            {requestStatus.details && (
                                <div>
                                    <p className="text-sm text-neutral-500 mb-1">Additional Details</p>
                                    <p className="text-foreground">{requestStatus.details}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-neutral-500 mb-1">Status</p>
                                <p className={`font-semibold ${getStatusColor()}`}>
                                    {getStatusText()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cancel Button (only when broadcasting) */}
                    {requestStatus.status === 'broadcasting' && (
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to cancel this request?')) {
                                        toast.success('Request cancelled');
                                        router.push('/');
                                    }
                                }}
                                className="w-full px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-foreground font-semibold rounded-xl transition-colors border border-neutral-200"
                            >
                                Cancel Request
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
