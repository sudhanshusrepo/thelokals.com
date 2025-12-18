'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const runtime = 'edge';

export default function BookingStatusPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [booking, setBooking] = useState<any>(null);
    const [otp, setOtp] = useState<string | null>(null);

    useEffect(() => {
        // Poll for status
        const fetchStatus = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setBooking(data);

                // If ACCEPTED or later, try to fetch/generate OTP
                if (data.status === 'ACCEPTED' || data.status === 'IN_PROGRESS') {
                    // Fetch OTP
                    const { data: otpData } = await supabase
                        .from('booking_otp')
                        .select('otp_code')
                        .eq('booking_id', id)
                        .single();

                    if (otpData) {
                        setOtp(otpData.otp_code);
                    } else if (data.status === 'ACCEPTED') {
                        // Try to generate if missing (User side trigger for MVP)
                        // In real app, trigger via RPC or Edge Function on Accept
                        // For MVP Phase 2/3, lets call the RPC
                        const { data: newOtp, error: rpcError } = await supabase.rpc('generate_booking_otp', { p_booking_id: id });
                        if (newOtp) setOtp(newOtp);
                    }
                }
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // 3s polling
        return () => clearInterval(interval);
    }, [id]);

    if (!booking) return <div className="p-10 text-center">Loading booking...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white p-4 shadow-sm text-center">
                <h1 className="font-bold">Booking #{id.slice(0, 8)}</h1>
                <p className="text-xs text-gray-500">{booking.status.replace('_', ' ')}</p>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center">
                {booking.status === 'PENDING' && (
                    <div className="text-center">
                        <div className="animate-spin text-4xl mb-4">⏳</div>
                        <h2 className="text-xl font-bold">Looking for Provider...</h2>
                        <p className="text-gray-500 mt-2">Please wait, this usually takes 2-5 minutes.</p>
                    </div>
                )}

                {booking.status === 'ACCEPTED' && (
                    <div className="text-center w-full max-w-sm bg-white p-6 rounded-xl shadow-lg">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-bold mb-2">Provider Found!</h2>
                        <p className="text-gray-600 mb-6">Share this PIN with provider to start job.</p>

                        <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
                            <span className="text-4xl font-mono font-bold tracking-widest text-indigo-600">
                                {otp || '....'}
                            </span>
                        </div>
                    </div>
                )}

                {booking.status === 'IN_PROGRESS' && (
                    <div className="text-center">
                        <div className="text-blue-500 text-5xl mb-4">⚙️</div>
                        <h2 className="text-xl font-bold">Work In Progress</h2>
                        <p className="text-gray-500 mt-2">Your service is being fulfilled.</p>
                    </div>
                )}

                {booking.status === 'COMPLETED' && (
                    <div className="text-center">
                        <div className="text-yellow-500 text-5xl mb-4">⭐</div>
                        <h2 className="text-xl font-bold">Job Completed!</h2>
                        <p className="text-gray-500 mt-2 mb-4">Total Amount: ₹{booking.final_cost / 100}</p>
                        <button className="bg-black text-white px-6 py-2 rounded-lg">Pay Now</button>
                    </div>
                )}
            </div>
        </div>
    );
}
