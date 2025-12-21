'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { AppBar } from '../../../components/home/AppBar';

export default function BookingTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) return;

        // 1. Fetch initial booking state
        const fetchBooking = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, service:services(name), provider:users!provider_id(name, phone)')
                .eq('id', bookingId)
                .single();

            if (data) setBooking(data);
            setLoading(false);
        };

        fetchBooking();

        // 2. Subscribe to realtime updates
        const channel = supabase
            .channel(`booking-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `id=eq.${bookingId}`
                },
                (payload: any) => {
                    console.log('Booking Update:', payload);
                    setBooking((prev: any) => ({ ...prev, ...payload.new }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!booking) return <div className="min-h-screen flex items-center justify-center">Booking not found</div>;

    const statusSteps = ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
    const currentStepIndex = statusSteps.indexOf(booking.status) > -1 ? statusSteps.indexOf(booking.status) : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />
            <div className="max-w-xl mx-auto px-4 py-8 mt-16">

                {/* Status Timeline */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                    <h2 className="font-bold text-slate-900 mb-6">Booking Status</h2>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step} className="relative">
                                    <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}></div>
                                    <h3 className={`text-sm font-bold ${isCompleted ? 'text-indigo-900' : 'text-slate-400'}`}>{step.replace('_', ' ')}</h3>
                                    {isCurrent && (
                                        <p className="text-xs text-indigo-600 mt-1 animate-pulse">Current Status</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                    <h3 className="font-bold text-slate-900 mb-4">Service Details</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span>Service</span>
                            <span className="font-medium text-slate-900">{booking.service?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Amount</span>
                            <span className="font-medium text-slate-900">₹{booking.total_amount_cents / 100}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Date</span>
                            <span className="font-medium text-slate-900">{new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Provider Card (Visible only if Confirmed or later) */}
                {booking.provider && (
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
                                👨‍🔧
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{booking.provider.name}</h3>
                                <p className="text-indigo-100 text-sm">is your assigned provider</p>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 bg-white text-indigo-600 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors">
                                Call {booking.provider.name}
                            </button>
                            <button className="flex-1 bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-800 transition-colors">
                                Message
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
