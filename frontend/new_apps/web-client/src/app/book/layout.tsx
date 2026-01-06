'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { designTokensV2 } from '../../theme/design-tokens-v2';
import { useBooking } from '../../contexts/BookingContext';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { bookingData } = useBooking();

    const steps = [
        { key: 'package', label: 'Package' },
        { key: 'schedule', label: 'Slot' },
        { key: 'address', label: 'Address' },
        { key: 'payment', label: 'Pay' }
    ];

    const currentStepIndex = steps.findIndex(s => pathname.includes(s.key));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-v2-text-primary">
                            {bookingData?.serviceName || 'Booking'}
                        </h1>
                        <div className="text-xs text-gray-500">
                            Step {currentStepIndex + 1} of {steps.length}
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="flex gap-2 mt-4 px-1">
                    {steps.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        return (
                            <div key={step.key} className="flex-1">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? '' : 'bg-gray-100'}`}
                                    style={{
                                        background: isActive ? designTokensV2.colors.gradient.css : undefined
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-4 pb-24">
                {children}
            </main>
        </div>
    );
}
