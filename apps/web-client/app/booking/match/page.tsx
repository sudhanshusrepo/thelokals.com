'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';

import { useBooking } from '../../../contexts/BookingContext';

export default function BookingMatchPage() {
    const router = useRouter();
    const { bookingData } = useBooking();
    const [status, setStatus] = useState('Analysing your request...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Redirection if no booking data
        if (!bookingData) {
            router.push('/');
            return;
        }

        // Simulate "AI Matching" sequence (Bible 6.3)
        const sequence = async () => {
            // ... same steps ...
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
    }, [bookingData, router]);

    // ... animateProgress ...
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
            if (!bookingData) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const payload = {
                user_id: user.id,
                service_code: bookingData.serviceCode || 'general-service',
                service_category: bookingData.serviceCategory,
                status: 'PENDING',
                estimated_cost: parseFloat((bookingData.estimatedPrice || 0).toFixed(2)),
                address: { full_address: bookingData.address },
                notes: bookingData.notes || null,
                requirements: {} as Record<string, unknown>
            };

            const { data, error } = await supabase
                .from('bookings')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            if (!data?.id) {
                throw new Error('No booking ID in response');
            }

            toast.success("Booking Request Sent!");
            router.push(`/bookings/${data.id}`);

        } catch (e: any) {
            console.error("Booking creation failed:", e?.message);
            toast.error(`Booking failed: ${e?.message || 'Unknown error'}`);
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
