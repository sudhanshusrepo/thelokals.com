'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '../../../contexts/BookingContext';
import { MapPin, Plus } from 'lucide-react';

export default function AddressStep() {
    const router = useRouter();
    const { bookingData, updateBooking, canProceed, nextStep } = useBooking();

    // Mock Saved Addresses
    const savedAddresses = [
        { id: '1', label: 'Home', address: '1204, Tower B, Supertech Emerald, Sector 65, Gurugram' },
        { id: '2', label: 'Office', address: 'WeWork Forum, Cyber City, Gurugram' }
    ];

    const [customAddress, setCustomAddress] = useState('');

    const handleSelectSaved = (addr: any) => {
        updateBooking({
            addressId: addr.id,
            addressDetails: addr.address
        });
    };

    const handleCustomAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomAddress(e.target.value);
        updateBooking({
            addressId: undefined, // Clear ID if custom
            addressDetails: e.target.value
        });
    };

    const [isShaking, setIsShaking] = useState(false);

    const handleContinue = () => {
        if (canProceed('address')) {
            nextStep();
            router.push('/book/payment');
        } else {
            // Trigger feedback
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold mb-6 text-v2-text-primary">Select Address</h2>

            {/* Saved Addresses */}
            <div className="space-y-4 mb-8">
                {savedAddresses.map(addr => {
                    const isSelected = bookingData?.addressId === addr.id;
                    return (
                        <div
                            key={addr.id}
                            onClick={() => handleSelectSaved(addr)}
                            className={`p-4 rounded-v2-card border cursor-pointer flex items-center gap-4 transition-all ${isSelected
                                ? 'border-v2-text-primary bg-gray-50'
                                : 'border-transparent bg-white shadow-v2-card'
                                }`}
                        >
                            <div className="p-2 bg-gray-100 rounded-full">
                                <MapPin size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">{addr.label}</div>
                                <div className="text-xs text-gray-500 line-clamp-1">{addr.address}</div>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Button (Mock) */}
                <button className="w-full p-4 rounded-v2-card border border-dashed border-gray-300 text-gray-500 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    <Plus size={20} />
                    <span className="font-medium">Add New Address</span>
                </button>
            </div>

            {/* Custom Input Fallback */}
            <div className={`mb-4 transition-transform ${isShaking ? 'translate-x-[-10px]' : ''}`}>
                <label className={`block text-sm font-medium mb-2 transition-colors ${isShaking ? 'text-red-500' : 'text-gray-700'}`}>
                    {isShaking ? 'Please enter address details' : 'Or enter address details'}
                </label>
                <textarea
                    className={`w-full p-3 border rounded-v2-btn focus:outline-none focus:ring-2 transition-all ${isShaking
                        ? 'border-red-500 ring-red-100'
                        : 'border-gray-300 focus:ring-v2-text-primary'
                        }`}
                    rows={3}
                    placeholder="House no, Floor, Landmark..."
                    value={customAddress}
                    onChange={handleCustomAddressChange}
                />
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>

            <button
                onClick={handleContinue}
                className={`w-full py-4 rounded-v2-btn font-bold mt-auto transition-all ${canProceed('address')
                    ? 'bg-v2-text-primary text-white shadow-lg active:scale-[0.99]'
                    : 'bg-gray-200 text-gray-400' /* Visual disabled state but clickable for feedback */
                    } ${isShaking ? 'shake bg-red-100 text-red-500' : ''}`}
            >
                Continue to Payment
            </button>
        </div>
    );
}
