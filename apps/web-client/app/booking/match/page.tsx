'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';

export default function BookingMatchPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Analysing your request...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate "AI Matching" sequence (Bible 6.3)
        const sequence = async () => {
            // 1. Analysis (0-30%)
            setStatus('Analysing issue details...');
            await animateProgress(0, 30, 800);

            // 2. Finding Provider (30-70%)
            setStatus('Scanning nearby verified providers...');
            await animateProgress(30, 70, 1500);

            // 3. Match Found (70-100%)
            setStatus('Best provider matched!');
            await animateProgress(70, 100, 500);

            // 4. Create Booking
            createBooking();
        };

        sequence();
    }, []);

    const animateProgress = (start: number, end: number, duration: number) => {
        return new Promise<void>(resolve => {
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = (end - start) / steps;
            let current = start;
            let count = 0;

            const interval = setInterval(() => {
                current += increment;
                count++;
                setProgress(Math.min(current, 100));

                if (count >= steps) {
                    clearInterval(interval);
                    resolve();
                }
            }, stepTime);
        });
    };

    const createBooking = async () => {
        try {
            const bookingIntentStr = localStorage.getItem('booking_intent');
            if (!bookingIntentStr) {
                router.push('/');
                return;
            }
            const intent = JSON.parse(bookingIntentStr);


            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Insert Actual Booking
            const { data: booking, error } = await supabase.from('bookings').insert({
                user_id: user.id,
                service_code: intent.service_code,
                status: 'PENDING',
                booking_type: 'LIVE',
                location: 'POINT(77.0266 28.4595)', // Mock Location
                base_price_cents: Math.round(intent.base_price * 100),
                total_amount_cents: Math.round(intent.final_price * 100),
                customer_location_lat: 28.4595,
                customer_location_lng: 77.0266,
                metadata: {
                    issue_type: intent.issue_type
                }
            }).select().single();

            if (error) throw error;

            toast.success("Provider Matched!");
            router.push(`/bookings/${booking.id}`);

        } catch (e: any) {
            console.error(e);
            toast.error("Matching failed. Please try again.");
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">

            {/* Radar Animation */}
            <div className="relative w-48 h-48 mb-12">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
                <div className="absolute inset-4 bg-indigo-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl animate-bounce">🤖</span>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">{status}</h1>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                AI is searching for the highest-rated pro near Sector 45...
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
