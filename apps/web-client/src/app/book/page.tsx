'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
        }
    }, [categoryId, router]);

    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    if (loading) {
        return (
            <div className="flex bg-white h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <BookingErrorBoundary>
            <main className="min-h-screen bg-gray-50 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {view === 'SELECTION' && category && (
                        <motion.div
                            key="selection"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <ServiceSelection
                                category={category}
                                onContinue={() => setView('FLOW')}
                            />
                        </motion.div>
                    )}

                    {view === 'FLOW' && (
                        <motion.div
                            key="flow"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {/* Components check internal state to decide visibility */}
                            <LiveBookingHub />
                            <PostBookingScreen />
                        </motion.div>
                    )}
                </AnimatePresence>
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
