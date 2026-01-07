'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '../../../contexts/BookingContext';
import { designTokensV2 } from '../../../theme/design-tokens-v2';
import { CheckCircle2 } from 'lucide-react';

export default function PackageStep() {
    const router = useRouter();
    const { bookingData, updateBooking, canProceed, nextStep } = useBooking();

    // Mock packages - In real app, fetch based on serviceId
    const packages = [
        {
            id: 'basic',
            name: 'Basic Service',
            price: bookingData?.basePrice || 499,
            features: ['Standard cleaning', '2 hours duration', 'Single pro']
        },
        {
            id: 'deep',
            name: 'Deep Clean',
            price: (bookingData?.basePrice || 499) + 300,
            features: ['Deep scrubbing', '3 hours duration', 'Sanitisation included', 'Two pros']
        }
    ];

    const handleSelect = (pkg: any) => {
        updateBooking({
            selectedPackageId: pkg.id,
            packagePrice: pkg.price,
            totalAmount: pkg.price // Update total
        });
    };

    const handleContinue = () => {
        if (canProceed('package')) {
            nextStep();
            router.push('/book/schedule');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 text-v2-text-primary">Select Package</h2>

            <div className="space-y-4 flex-1">
                {packages.map(pkg => {
                    const isSelected = bookingData?.selectedPackageId === pkg.id;
                    return (
                        <div
                            key={pkg.id}
                            onClick={() => handleSelect(pkg)}
                            className={`p-5 rounded-v2-card border-2 cursor-pointer transition-all duration-200 ${isSelected
                                ? 'border-v2-accent-warning bg-yellow-50/50'
                                : 'border-transparent bg-white shadow-v2-card'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg">{pkg.name}</h3>
                                {isSelected && <CheckCircle2 className="text-v2-accent-warning" />}
                            </div>
                            <div className="text-2xl font-bold mb-4">₹{pkg.price}</div>
                            <ul className="space-y-2">
                                {pkg.features.map((feat, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleContinue}
                disabled={!canProceed('package')}
                className={`w-full py-4 rounded-v2-btn font-bold mt-6 transition-all ${canProceed('package')
                    ? 'bg-v2-text-primary text-white shadow-lg active:scale-[0.99]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                Continue
            </button>
        </div>
    );
}
