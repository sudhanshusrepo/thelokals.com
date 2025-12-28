'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { Button } from '../../../components/ui/Button';
import { AppBar } from '../../../components/home/AppBar';
import { toast } from 'react-hot-toast';

export default function BookingTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!bookingId) return;

        // 1. Fetch initial booking state
        const fetchBooking = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, provider:providers(*)') // Restored provider join
                .eq('id', bookingId)
                .single();

            if (error) {
                console.error('Error fetching booking:', error);
            }
            if (data) {
                console.log('Fetched Booking Data:', data);
                setBooking(data);
            } else {
                console.error('No booking data found for ID:', bookingId);
            }
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

    const [otp, setOtp] = useState<string | null>(null);

    useEffect(() => {
        if (!bookingId || !booking) return;

        const fetchOtp = async () => {
            if (booking.status === 'ACCEPTED' || booking.status === 'IN_PROGRESS') {
                const { data: otpData } = await supabase
                    .from('booking_otp')
                    .select('otp_code')
                    .eq('booking_id', bookingId)
                    .single();

                if (otpData) {
                    setOtp(otpData.otp_code);
                } else if (booking.status === 'ACCEPTED') {
                    // Try to generate if missing (User side trigger for MVP)
                    const { data: newOtp } = await supabase.rpc('generate_booking_otp', { p_booking_id: bookingId });
                    if (newOtp) setOtp(newOtp);
                }
            }
        };
        fetchOtp();
    }, [bookingId, booking?.status]);

    const handleCancelBooking = async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        setCancelling(true);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'CANCELLED' })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success('Booking cancelled successfully');
            router.push('/');
        } catch (error: any) {
            console.error('Cancel Error:', error);
            toast.error('Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-xl font-semibold text-slate-900 mb-2">Booking not found</p>
                    <button
                        onClick={() => router.push('/')}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const statusSteps = ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
    const currentStepIndex = statusSteps.indexOf(booking.status) > -1 ? statusSteps.indexOf(booking.status) : 0;
    const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

    const statusEmojis: Record<string, string> = {
        'PENDING': '⏳',
        'CONFIRMED': '✅',
        'EN_ROUTE': '🚗',
        'IN_PROGRESS': '🔧',
        'COMPLETED': '🎉',
        'CANCELLED': '❌'
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />
            <div className="max-w-xl mx-auto px-4 py-8 mt-16">

                {/* Status Timeline */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">Booking Status</h2>
                        <span className="text-2xl">{statusEmojis[booking.status] || '📋'}</span>
                    </div>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step} className="relative">
                                    <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}></div>
                                    <h3 className={`text-sm font-bold ${isCompleted ? 'text-indigo-900' : 'text-slate-400'}`}>
                                        {step.replace('_', ' ')}
                                    </h3>
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
                            <span className="font-medium text-slate-900">{booking.service_category || booking.service?.name || 'Service'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Amount</span>
                            <span className="font-medium text-slate-900">₹{booking.total_amount_cents / 100}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Date</span>
                            <span className="font-medium text-slate-900">{new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Booking ID</span>
                            <span className="font-mono text-xs text-slate-500">{bookingId.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                {/* Provider Card (Visible only if Confirmed or later) */}
                {booking.provider && (
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
                                👨‍🔧
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{booking.provider.name}</h3>
                                <p className="text-indigo-100 text-sm">is your assigned provider</p>
                            </div>
                        </div>

                        {/* OTP Display for Client */}
                        {booking.status === 'ACCEPTED' && (
                            <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4 backdrop-blur-sm">
                                <p className="text-indigo-100 text-xs mb-1 uppercase tracking-wider font-semibold">Start Code</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-white text-sm opacity-90">Share this PIN with provider to start service</p>
                                    <span className="text-3xl font-mono font-bold tracking-widest text-white">
                                        {otp || '....'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                                📞 Call {booking.provider.name}
                            </button>
                            <button className="flex-1 bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-800 transition-colors">
                                💬 Message
                            </button>
                        </div>
                    </div>
                )}

                {/* Cancel Button */}
                {canCancel && (
                    <Button
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        variant="danger"
                        fullWidth
                        className="mb-4"
                    >
                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                )}

                {/* Back Button */}
                <Button
                    onClick={() => router.push('/')}
                    variant="ghost"
                    fullWidth
                >
                    ← Back to Home
                </Button>
            </div>
        </div>
    );
}
