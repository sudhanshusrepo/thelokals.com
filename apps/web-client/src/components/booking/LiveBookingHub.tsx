'use client';

import React, { useState } from 'react';
import { ServiceCategory, GoogleMapProvider } from '@thelocals/platform-core';
import { Map, Marker } from '@vis.gl/react-google-maps';
import { ArrowLeft, MapPin, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth, liveBookingService, LiveBooking } from '@thelocals/platform-core';
import { SearchingRadar } from './SearchingRadar';

interface LiveBookingHubProps {
    serviceCategory: ServiceCategory;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 19.0760,
    lng: 72.8777
};

export default function LiveBookingHub({ serviceCategory }: LiveBookingHubProps) {
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [step, setStep] = useState<'DRAFT' | 'SEARCHING' | 'CONFIRMED'>('DRAFT');
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);

    const [currentBooking, setCurrentBooking] = useState<LiveBooking | null>(null);

    const handleConfirm = async () => {
        if (!user) {
            toast.error("Please login to continue");
            router.push(`/login?redirect=/book?category_id=${serviceCategory.id}`);
            return;
        }

        try {
            setStep('SEARCHING');

            // 1. Create Booking
            const booking = await liveBookingService.createLiveBooking({
                clientId: user.id,
                serviceId: serviceCategory.id,
                requirements: {
                    location: { lat: 19.0760, lng: 72.8777 }, // Using mock/center for now, ideally user location
                    date: bookingDate
                }
            });
            setCurrentBooking(booking);

            // 2. Start Searching (Find & Request Providers)
            await liveBookingService.startSearching(booking);

            // 3. Subscribe to updates
            const channel = liveBookingService.subscribeToBookingUpdates(
                booking.id,
                (payload) => {
                    const newRecord = payload.new as any;
                    const newStatus = newRecord.status;
                    if (newStatus === 'CONFIRMED' || newStatus === 'EN_ROUTE') {
                        setStep('CONFIRMED');
                        toast.success("Provider Found!");
                    }
                }
            );

            // Cleanup subscription on unmount handled by useEffect usually, 
            // but here we just leave it for the flow lifetime.

        } catch (error: any) {

            toast.error(error.message || "Failed to start booking");
            setStep('DRAFT');
        }
    };

    if (step === 'SEARCHING') {
        return (
            <SearchingRadar
                serviceName={serviceCategory.name}
                onCancel={() => {
                    setStep('DRAFT');
                }}
            />
        );
    }

    if (step === 'CONFIRMED') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-green-50 text-gray-900 p-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6">
                    🎉
                </div>
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-8">Provider is on the way.</p>
                <button onClick={() => router.push('/bookings')} className="bg-black text-white px-8 py-3 rounded-xl font-bold">
                    View Booking
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Map Header */}
            <div className="h-1/3 w-full relative">
                <GoogleMapProvider>
                    <Map
                        defaultCenter={center}
                        defaultZoom={15}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Marker position={center} />
                    </Map>
                </GoogleMapProvider>

                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg text-gray-700"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Config Panel */}
            <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 p-6 shadow-2xl overflow-y-auto">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{serviceCategory.name}</h1>
                <p className="text-gray-500 mb-6">{serviceCategory.description}</p>

                <div className="space-y-6">
                    {/* Location */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                        <MapPin className="text-lokals-red" size={20} />
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                            <p className="font-bold text-gray-900 line-clamp-1">Mumbai, Maharashtra (Detected)</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                        <Clock className="text-lokals-yellow" size={20} />
                        <div className="w-full">
                            <p className="text-xs text-gray-400 font-bold uppercase">Schedule</p>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="bg-transparent font-bold text-gray-900 w-full outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Total Estimate</p>
                        <p className="text-2xl font-bold text-gray-900">₹{serviceCategory.base_price || 499}</p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
