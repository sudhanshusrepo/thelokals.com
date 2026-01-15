'use client';

import React, { useEffect } from 'react';
import { useAuth, liveBookingService } from '@thelocals/platform-core';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function GlobalSubscriptionWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        console.log("📡 Initializing Provider Subscription for:", user.id);

        const channel = liveBookingService.subscribeToProviderRequests(
            user.id,
            (payload) => {
                console.log("🔔 New Booking Request!", payload);
                // Show Persistent Toast
                toast((t) => (
                    <div onClick={() => {
                        toast.dismiss(t.id);
                        // Redirect to Incoming Request or refresh list
                        // For now, let's just show info
                    }} className="cursor-pointer">
                        <p className="font-bold">New Job Request!</p>
                        <p className="text-sm">A customer nearby needs help.</p>
                        <button className="mt-2 bg-black text-white px-3 py-1 rounded text-xs" onClick={() => router.push('/dashboard')}>
                            View Dashboard
                        </button>
                    </div>
                ), { duration: 10000, position: 'top-center' });
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
