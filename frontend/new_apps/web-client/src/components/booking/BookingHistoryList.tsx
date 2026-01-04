'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@thelocals/core/types';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';

interface BookingHistoryListProps {
    bookings: Booking[];
    loading: boolean;
}

export function BookingHistoryList({ bookings, loading }: BookingHistoryListProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 animate-pulse">
                        <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-3 bg-neutral-100 rounded w-full"></div>
                            <div className="h-3 bg-neutral-100 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-dashed border-neutral-200">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="text-neutral-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">No bookings yet</h3>
                <p className="text-neutral-500 text-center mb-6">Book a professional for your home service needs.</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                    Browse Services
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    onClick={() => router.push(`/booking/${booking.id}`)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 active:scale-[0.98] transition-transform cursor-pointer"
                >
                    {/* Header: Service Name & Status */}
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-semibold text-neutral-900">
                                {booking.service?.name || 'Service Request'}
                            </h3>
                            <div className="text-xs text-neutral-500 mt-1">
                                ID: #{booking.id.slice(0, 8)}
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                            {booking.status}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-neutral-600">
                        {/* Provider */}
                        {booking.provider && (
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-neutral-400" />
                                <span>{booking.provider.name}</span>
                            </div>
                        )}

                        {/* Date & Time */}
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-neutral-400" />
                            <span>
                                {new Date(booking.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 text-neutral-900 font-medium">
                            <span>₹{booking.final_cost || booking.estimated_cost || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-700';
        case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
        case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700';
        case 'CANCELLED': return 'bg-red-100 text-red-700';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}
