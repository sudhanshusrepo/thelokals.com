'use client';

import Link from 'next/link';

export const runtime = 'edge';

export default function BookingConfirmed() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold mb-2">Booking Requested!</h1>
            <p className="text-gray-600 mb-8">
                We are looking for a nearby provider for you. You will be notified once they accept.
            </p>

            <div className="w-full bg-gray-50 p-4 rounded-xl mb-8 text-left animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
                    </div>
                </div>
                <p className="text-xs text-center mt-4 text-gray-400">Searching nearby...</p>
            </div>

            <Link href="/" className="text-indigo-600 font-bold">
                Back to Home
            </Link>
        </div>
    );
}
