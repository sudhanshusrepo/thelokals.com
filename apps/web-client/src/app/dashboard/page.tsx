'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        // For now, default to the bookings view as the main dashboard
        router.push('/dashboard/bookings');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-v2-text-primary animate-spin" />
        </div>
    );
}
