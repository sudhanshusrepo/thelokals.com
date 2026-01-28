'use client';

import React from 'react';
import { useAuth } from '@thelocals/platform-core';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return <div className="p-8 text-center">Please login to view bookings.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

            <div className="space-y-4">
                {/* Empty State Mock */}
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">📅</div>
                    <p className="text-gray-500 mb-4">No bookings yet.</p>
                    <button onClick={() => router.push('/')} className="text-lokals-green font-bold hover:underline">Book a Service</button>
                </div>

                {/* TODO: Add list when backend is connected */}
            </div>
        </div>
    );
}
