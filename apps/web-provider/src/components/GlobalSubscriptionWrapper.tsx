'use client';

import React, { useEffect } from 'react';
import { useAuth, liveBookingService, useProviderHeartbeat } from '@thelocals/platform-core';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function GlobalSubscriptionWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();

    // 1. Keep Provider Online
    useProviderHeartbeat({ enabled: !!user });

    // 2. Network Resilience
    useEffect(() => {
        const handleOnline = () => toast.success('You are back online!');
        const handleOffline = () => toast.error('You are offline. Please check your connection.', { duration: Infinity, id: 'offline-toast' });

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        const channel = liveBookingService.subscribeToProviderRequests(
            user.id,
            (payload) => {
                const requestRecord = payload.new as any;
                const bookingId = requestRecord.booking_id;

                // Show Persistent Toast with Sound (if possible, but browser blocks audio usually)
                toast((t) => (
                    <div className="flex flex-col gap-2 min-w-[250px]">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔔</span>
                            <div>
                                <p className="font-bold text-lg">New Job Request!</p>
                                <p className="text-sm text-gray-600">Click to view details</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    router.push(`/jobs/request/${bookingId}`);
                                }}
                                className="flex-1 bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                            >
                                View Job
                            </button>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-2 bg-gray-100 rounded-lg font-medium text-gray-600 hover:bg-gray-200"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ), {
                    duration: 15000,
                    position: 'top-center',
                    style: {
                        background: '#fff',
                        color: '#000',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid #f0f0f0',
                        borderRadius: '16px',
                        padding: '16px'
                    }
                });
            }
        );

        return () => { liveBookingService.unsubscribeFromChannel(channel); }
    }, [user, router]);

    return (
        <>
            <Toaster position="top-right" />
            {children}
        </>
    );
}
