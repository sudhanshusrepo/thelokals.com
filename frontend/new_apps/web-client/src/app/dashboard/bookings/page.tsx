'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusCard } from '../../../components/v2/StatusCard';
import { designTokensV2 } from '../../../theme/design-tokens-v2';

export default function BookingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    // Mock Bookings Data
    const bookings = [
        {
            id: '1',
            serviceName: 'AC Deep Cleaning',
            date: 'Today',
            time: '02:00 PM',
            status: 'assigned',
            imageUrl: '/services/ac.jpg',
            price: 799,
        },
        {
            id: '2',
            serviceName: 'Bathroom Cleaning',
            date: 'Tomorrow',
            time: '10:00 AM',
            status: 'pending',
            imageUrl: '/services/cleaning.jpg',
            price: 499,
        },
        {
            id: '3',
            serviceName: 'Sofa Cleaning',
            date: 'Aug 12',
            time: '04:00 PM',
            status: 'completed',
            imageUrl: '/services/sofa.jpg',
            price: 1299,
        }
    ];

    const filteredBookings = bookings.filter(b =>
        activeTab === 'active'
            ? ['pending', 'assigned', 'in_progress'].includes(b.status)
            : ['completed', 'cancelled'].includes(b.status)
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-v2-text-primary mb-6">My Bookings</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-100">
                {['active', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 px-1 text-sm font-medium capitalize transition-all relative ${activeTab === tab
                                ? 'text-v2-text-primary'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab} Bookings
                        {activeTab === tab && (
                            <div
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ background: designTokensV2.colors.gradient.css }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                        <StatusCard
                            key={booking.id}
                            booking={booking as any}
                            onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-v2-card border border-dashed border-gray-200">
                        <p>No {activeTab} bookings found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
