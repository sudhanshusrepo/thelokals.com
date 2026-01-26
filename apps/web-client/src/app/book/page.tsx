'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { adminService } from '@thelocals/platform-core/services/adminService';
import { ServiceCategory } from '@thelocals/platform-core';

// Dynamic import for Map heavy component
const LiveBookingHub = dynamic(() => import('../../components/booking/LiveBookingHub'), {
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center">Loading Booking Hub...</div>
});

function BookingContent() {
    const searchParams = useSearchParams();
    const categoryId = searchParams.get('category_id');
    const [category, setCategory] = React.useState<ServiceCategory | null>(null);

    React.useEffect(() => {
        if (categoryId) {
            adminService.getServiceCategory(categoryId).then(setCategory);
        }
    }, [categoryId]);

    if (!categoryId) return <div>Please select a service first.</div>;
    if (!category) return <div className="h-screen flex items-center justify-center">Loading Service...</div>;

    return <LiveBookingHub serviceCategory={category} />;
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
