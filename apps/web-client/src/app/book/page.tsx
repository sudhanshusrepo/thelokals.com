'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingService, ServiceCategory } from '@thelocals/platform-core';
import ServiceSelection from '../../components/booking/ServiceSelection';
// Dynamic import to avoid SSR issues with map
import dynamic from 'next/dynamic';
import { BookingErrorBoundary } from '../../components/booking/BookingErrorBoundary';

const LiveBookingHub = dynamic(() => import('../../components/booking/LiveBookingHub'), { ssr: false });
const PostBookingScreen = dynamic(() => import('../../components/booking/PostBookingScreen'), { ssr: false });

function BookingFlowContent() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category_id');

    const [view, setView] = useState<'SELECTION' | 'FLOW'>('SELECTION');
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

    const router = useRouter();

    useEffect(() => {
        if (!categoryId) {
            // Redirect to Home to select a service
            router.replace('/');
            return;
        }
        <BookingErrorBoundary>
            <main className="min-h-screen bg-gray-50">
                {view === 'SELECTION' && (
                    <ServiceSelection
                        category={category}
                        onContinue={() => setView('FLOW')}
                    />
                )}

                {view === 'FLOW' && (
                    <>
                        {/* Components check internal state to decide visibility */}
                        {/* In a real router, these would be separate routes or a better layout */}
                        <LiveBookingHub />
                        <PostBookingScreen />
                    </>
                )}
            </main>
        </BookingErrorBoundary>
        );
}

export default function BookingFlowV2() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingFlowContent />
        </Suspense>
    );
}
