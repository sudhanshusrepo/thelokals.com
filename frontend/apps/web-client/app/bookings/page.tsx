'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useV2Design } from '@/lib/feature-flags';
import { AppBar, StatusCard } from '@/components/v2';
import { designTokensV2 } from '@/theme/design-tokens-v2';

// V2 Design Component
function BookingsPageV2() {
    const [filter, setFilter] = useState<'active' | 'past'>('active');

    const mockBookings = [
        {
            id: '1',
            serviceName: 'AC Repair',
            date: 'Today',
            time: '2:30 PM',
            status: 'in-progress' as const,
            provider: 'Rajesh Kumar',
        },
        {
            id: '2',
            serviceName: 'Home Cleaning',
            date: 'Dec 24',
            time: '10:00 AM',
            status: 'completed' as const,
            provider: 'Sunita Devi',
        },
        {
            id: '3',
            serviceName: 'Plumbing',
            date: 'Dec 28',
            time: '11:00 AM',
            status: 'requested' as const, // Mapping legacy 'pending' to 'requested'
        },
        {
            id: '4',
            serviceName: 'Electrical Check',
            date: 'Nov 20',
            time: '4:00 PM',
            status: 'cancelled' as const,
        },
    ];

    const filteredBookings = mockBookings.filter((b) => {
        if (filter === 'active')
            return ['requested', 'accepted', 'in-progress'].includes(b.status);
        return ['completed', 'cancelled'].includes(b.status);
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', paddingBottom: '80px' }}>
            <AppBar title="My Bookings" />

            <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    {['active', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab as 'active' | 'past')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: designTokensV2.radius.pill,
                                backgroundColor: filter === tab ? '#0E121A' : 'white',
                                color: filter === tab ? 'white' : '#666',
                                border: 'none',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                                boxShadow: filter === tab ? designTokensV2.shadows.card : 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredBookings.length === 0 ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px',
                                backgroundColor: 'white',
                                borderRadius: designTokensV2.radius.card,
                                color: '#666',
                            }}
                        >
                            No {filter} bookings found
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div key={booking.id} style={{ position: 'relative' }}>
                                <a href={`/bookings/${booking.id}`} style={{ textDecoration: 'none' }}>
                                    <StatusCard
                                        status={booking.status}
                                        serviceName={booking.serviceName}
                                        bookingDate={booking.date}
                                        bookingTime={booking.time}
                                        providerName={booking.provider}
                                    />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Legacy Component (Kept for fallback)
function BookingsPageLegacy() {
    const router = useRouter();
    const [filter, setFilter] = useState<'active' | 'past'>('active');

    const mockBookings = [
        {
            id: '1',
            serviceName: 'AC Repair',
            providerName: 'Rajesh Kumar',
            date: 'Today',
            time: '2:30 PM',
            status: 'in_progress',
            price: '₹450',
        },
        {
            id: '2',
            serviceName: 'Home Cleaning',
            providerName: 'Sunita Devi',
            date: 'Dec 24',
            time: '10:00 AM',
            status: 'completed',
            price: '₹1200',
        },
        {
            id: '3',
            serviceName: 'Plumbing',
            date: 'Dec 28',
            time: '11:00 AM',
            status: 'pending',
            price: 'Est. ₹300',
        },
        {
            id: '4',
            serviceName: 'Electrical Check',
            date: 'Nov 20',
            time: '4:00 PM',
            status: 'cancelled',
            price: '₹90',
        },
    ];

    const filteredBookings = mockBookings.filter(b => {
        if (filter === 'active') return ['pending', 'accepted', 'in_progress'].includes(b.status);
        return ['completed', 'cancelled'].includes(b.status);
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'accepted': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'in_progress': return 'bg-teal-50 text-teal-700 border-teal-100';
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusLabel = (status: string) => {
        if (status === 'in_progress') return 'On the way';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900">My Bookings</h1>
                    <Link href="/home" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                        Home
                    </Link>
                </div>
            </header>

            <main className="max-w-md mx-auto p-4">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg px-4 pt-2">
                    <button
                        onClick={() => setFilter('active')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${filter === 'active'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${filter === 'past'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Past
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-200">
                            <p className="text-slate-500">No {filter} bookings found</p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <Link
                                href={`/bookings/${booking.id}`}
                                key={booking.id}
                                className="block bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-teal-200 transition-all hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{booking.serviceName}</h3>
                                        <p className="text-sm text-slate-500">{booking.date} • {booking.time}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                        {getStatusLabel(booking.status)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                                            👤
                                        </div>
                                        <span>{booking.providerName || 'Waiting for provider...'}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{booking.price}</span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

export default function BookingsPage() {
    const showV2 = useV2Design();
    return showV2 ? <BookingsPageV2 /> : <BookingsPageLegacy />;
}
