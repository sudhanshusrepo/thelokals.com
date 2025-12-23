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

            const { data: { user }, data: { session } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const payload = {
                user_id: user.id,
                service_code: 'bathroom-fitting',
                service_category: bookingData.serviceCategory,
                status: 'PENDING',
                estimated_cost: parseFloat((bookingData.estimatedPrice || 499).toFixed(2)), // Force decimal
                address: { full_address: bookingData.address },
                notes: bookingData.notes || null, // NULL instead of empty string
                requirements: {} as Record<string, unknown>
            };

            console.log('=== BOOKING INSERT PAYLOAD ===');
            console.log(JSON.stringify(payload, null, 2));
            console.log('==============================');

            // RAW FETCH API - Bypass Supabase-JS to capture full HTTP response
            const SUPABASE_URL = 'http://127.0.0.1:54321';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

            // Get session token
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token || SUPABASE_ANON_KEY;

            const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(payload)
            });

            console.log('=== RAW HTTP RESPONSE ===');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));
            console.log('========================');

            const responseText = await response.text();
            console.log('=== RESPONSE BODY ===');
            console.log('Raw Text:', responseText);
            console.log('====================');

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                    console.error('=== PARSED ERROR ===');
                    console.error('Code:', errorData.code);
                    console.error('Message:', errorData.message);
                    console.error('Details:', errorData.details);
                    console.error('Hint:', errorData.hint);
                    console.error('Full Error:', JSON.stringify(errorData, null, 2));
                    console.error('===================');
                } catch (parseError) {
                    console.error('Failed to parse error response:', responseText);
                }
                throw new Error(`HTTP ${response.status}: ${errorData?.message || responseText}`);
            }

            const data = JSON.parse(responseText);
            const bookingId = data[0]?.id || data.id;

            if (!bookingId) {
                throw new Error('No booking ID in response');
            }

            toast.success("Booking Request Sent!");
            router.push(`/bookings/${bookingId}`);

        } catch (e: any) {
            console.error("=== BOOKING CREATION FAILED ===");
            console.error("Exception:", e);
            console.error("Exception Message:", e?.message);
            console.error("Exception Stack:", e?.stack);
            console.error("===============================");
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
