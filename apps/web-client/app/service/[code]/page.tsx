'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export const runtime = 'edge';

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        async function fetchService() {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('code', code)
                .single();

            if (data) setService(data);
            setLoading(false);
        }
        fetchService();
    }, [code]);

    const handleBookNow = async () => {
        setBookingLoading(true);
        try {
            // Get current user (mock or real)
            // For MVP Phase 2, we assume anonymous or pre-seeded user if auth not enforced yet
            // But strict RLS might fail if not auth. 
            // Implementation Plan said "Phone Login" was done in Phase 1 for Provider, 
            // but for User App Phase 1 was just "Service Discovery".
            // So we might need to handle "Guest" booking or quick auth.
            // For MVP simplicity, we'll try to get user, if not exists, we prompt "Please Login" (mock).

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // For MVP Demo: Auto-login with test account if no session exists
                // In production, this would redirect to /login
                try {
                    const { error } = await supabase.auth.signInWithPassword({
                        email: 'demo@user.com',
                        password: 'password'
                    });
                    if (error) {
                        toast.error("Please login to book");
                        return; // Stop if login fails
                    }
                } catch (err) {
                    console.error("Auto-login failed", err);
                    toast.error("Login required");
                    return;
                }
            }

            // Refetch user after potential auto-login
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) {
                toast.error("Authentication failed");
                return;
            }

            const user_id = currentUser?.id || '00000000-0000-0000-0000-000000000000'; // Fallback will fail FK

            const { data: booking, error } = await supabase.from('bookings').insert({
                user_id: currentUser.id, // This needs to be valid.
                service_code: code,
                status: 'PENDING', // Waiting for provider
                booking_type: 'LIVE',
                location: 'POINT(77.0266 28.4595)', // Gurugram
                base_price_cents: service.base_price_cents,
                total_amount_cents: service.base_price_cents, // Simple logic
                customer_location_lat: 28.4595,
                customer_location_lng: 77.0266
            }).select().single();

            if (error) throw error;

            toast.success("Booking Request Sent!");
            router.push('/booking-confirmed');

        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Booking Failed");
            // If error is RLS/User, we might need a quick hack for the demo user
            if (e.message.includes('user_id')) {
                toast('You need to be logged in. (Dev Note: Implement User Auth)');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!service) return <div className="p-10 text-center">Service not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-2">
                <button onClick={() => router.back()} className="text-xl">←</button>
                <h1 className="font-bold text-lg">{service.name}</h1>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-4xl mb-4">🔧</div>
                    <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
                    <p className="text-gray-600 mb-6">{service.description}</p>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">Base Price</span>
                            <span className="font-bold">₹{service.base_price_cents / 100}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-bold">{service.duration_minutes_min} mins</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-bold mb-2">What's Included</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 bg-white p-4 rounded-xl">
                        <li>Professional service delivery</li>
                        <li>Post-service cleanup</li>
                        <li>TheLokals Safety Guarantee</li>
                    </ul>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm">Total</span>
                    <span className="text-xl font-bold">₹{service.base_price_cents / 100}</span>
                </div>
                <button
                    onClick={handleBookNow}
                    disabled={bookingLoading}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold text-lg disabled:opacity-70"
                >
                    {bookingLoading ? 'Requesting...' : 'Book Now'}
                </button>
            </div>
        </div>
    );
}
