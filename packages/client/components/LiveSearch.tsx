import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@core/services/bookingService';
import { useGeolocation } from '../hooks/useGeolocation';
import { supabase } from '../../core/services/supabase';

// Lazy load the map component
const MapComponent = lazy(() => import('./MapComponent').then(module => ({ default: module.MapComponent })));

interface LiveSearchProps {
    onCancel: () => void;
    bookingId?: string;
}

export const LiveSearch: React.FC<LiveSearchProps> = ({ onCancel, bookingId }) => {
    const [status, setStatus] = useState('Searching for nearby professionals...');
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const { location } = useGeolocation();

    useEffect(() => {
        let mounted = true;

        const performSearch = async () => {
            if (!bookingId || !location) return;

            try {
                // 1. Fetch booking details to get category
                const booking = await bookingService.getBooking(bookingId);
                if (!booking || !mounted) return;

                setStatus(`Searching for ${booking.service_category || 'professionals'}...`);

                // 2. Find nearby providers
                const { data: providers, error } = await supabase.rpc('find_nearby_providers', {
                    lat: location.lat,
                    long: location.lng,
                    radius_km: 15,
                    service_category: booking.service_category
                });

                if (error) throw error;

                if (mounted) {
                    if (providers && providers.length > 0) {
                        setStatus(`Contacting ${providers.length} nearby professionals...`);
                        setProgress(60);
                        // In production: Trigger push notifications here
                    } else {
                        setStatus('No providers found nearby. Expanding search...');
                        setProgress(40);
                    }
                }
            } catch (err) {
                console.error('Search error:', err);
                if (mounted) setStatus('Error searching for providers.');
            }
        };

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return 90; // Hold at 90% until accepted
                return prev + 1;
            });
        }, 500);

        performSearch();

        return () => {
            mounted = false;
            clearInterval(progressInterval);
        };
    }, [bookingId, location]);

    // Subscribe to booking updates if bookingId is provided
    useEffect(() => {
        if (!bookingId) return;

        const unsubscribe = bookingService.subscribeToBookingUpdates(bookingId, (booking) => {
            if (booking.worker) {
                setStatus('Provider matched! Redirecting...');
                setTimeout(() => {
                    navigate(`/booking/${bookingId}`);
                }, 1000);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [bookingId, navigate]);

    return (
        <div
            className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col"
            data-testid="live-search-screen"
        >
            {/* Map Background */}
            <div className="absolute inset-0 z-0 opacity-50">
                {location ? (
                    <Suspense fallback={<div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse" />}>
                        <MapComponent center={location} isScanning={true} />
                    </Suspense>
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                )}
            </div>

            {/* Overlay Content */}
            <div className="relative z-10 flex flex-col items-center justify-end h-full pb-12 px-6 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-2xl animate-bounce">
                                🔍
                            </div>
                            <div className="absolute inset-0 border-4 border-teal-500 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {status}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Finding the best match for you
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <button
                        onClick={onCancel}
                        data-testid="cancel-search-button"
                        className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel Request
                    </button>
                </div>
            </div>
        </div>
    );
};
