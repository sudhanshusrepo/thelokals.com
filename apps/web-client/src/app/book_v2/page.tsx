'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { bookingService, ServiceCategory } from '@thelocals/platform-core';
import ServiceSelection from '../../components/booking/ServiceSelection';
// Dynamic import to avoid SSR issues with map
import dynamic from 'next/dynamic';

const LiveBookingHub = dynamic(() => import('../../components/booking/LiveBookingHub'), { ssr: false });

function BookingFlowContent() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category_id');

    const [view, setView] = useState<'SELECTION' | 'LIVE_HUB'>('SELECTION');
    const [category, setCategory] = useState<ServiceCategory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!categoryId) {
            setLoading(false);
            return;
        }

        const loadCategory = async () => {
            const data = await bookingService.getServiceCategory(categoryId);
            setCategory(data as ServiceCategory);
            setLoading(false);
        };
        loadCategory();
    }, [categoryId]);

    if (!categoryId) {
        return <div className="p-8 text-center">Invalid Booking Link: No Category ID</div>;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!category) {
        return <div className="p-8 text-center">Service Category Not Found</div>;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {view === 'SELECTION' && (
                <ServiceSelection
                    category={category}
                    onContinue={() => setView('LIVE_HUB')}
                />
            )}

            {view === 'LIVE_HUB' && (
                <LiveBookingHub />
            )}
        </main>
    );
}

export default function BookingFlowV2() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingFlowContent />
        </Suspense>
    );
}
