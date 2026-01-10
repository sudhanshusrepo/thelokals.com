'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService, Booking } from '@thelocals/platform-core';
import { Surface, Section } from '../../../components/ui/Wrappers';
import { Calendar, Clock, MapPin, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { StatusCard } from '../../../components/v2/StatusCard';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    const bookingId = params.id as string;

    useEffect(() => {
        if (user && bookingId) {
            loadBooking();
        }
    }, [user, bookingId]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getBookingDetails(bookingId);
            setBooking(data);
        } catch (error) {
            console.error('Failed to load booking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 p-4 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-neutral-50 p-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
                <p className="text-gray-600 mb-6">We couldn't find the booking you're looking for.</p>
                <button
                    onClick={() => router.back()}
                    className="text-lokals-green font-bold hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const worker = (booking as any).worker;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-50 pb-24">
                {/* Header */}
                <header className="bg-white border-b border-neutral-200 px-4 py-4 sticky top-0 z-30 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-neutral-900">Booking Details</h1>
                </header>

                <main className="p-4 max-w-md mx-auto space-y-4">
                    {/* Status Card */}
                    <Surface elevated className="!p-0 overflow-hidden">
                        <StatusCard
                            booking={{
                                id: booking.id,
                                serviceName: (booking as any).serviceName || 'Service',
                                status: booking.status === 'PENDING' ? 'assigned' : (booking.status.toLowerCase() as any),
                                date: new Date(booking.scheduled_date || booking.created_at).toLocaleDateString(),
                                time: new Date(booking.scheduled_date || booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                imageUrl: worker?.imageUrl || '/services/ac.jpg'
                            }}
                            onClick={() => { }}
                        />
                    </Surface>

                    {/* Timeline / Progress */}
                    <Section>
                        <h3 className="font-bold text-gray-900 mb-3">Timeline</h3>
                        <Surface className="space-y-4">
                            {[
                                { status: 'REQUESTED', label: 'Booking Requested', date: booking.created_at },
                                { status: 'CONFIRMED', label: 'Provider Confirmed', date: booking.updated_at }, // Mock logic
                                { status: 'COMPLETED', label: 'Service Completed', date: null }
                            ].map((step, idx) => {
                                const isCompleted = ['COMPLETED', 'IN_PROGRESS'].includes(booking.status) ||
                                    (booking.status === 'CONFIRMED' && step.status !== 'COMPLETED') ||
                                    idx === 0;

                                return (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-lokals-green border-lokals-green text-white' : 'border-gray-300 text-transparent'}`}>
                                                <CheckCircle size={12} />
                                            </div>
                                            {idx < 2 && <div className={`w-0.5 h-full my-1 ${isCompleted ? 'bg-lokals-green' : 'bg-gray-200'}`} />}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                            {step.date && isCompleted && <p className="text-xs text-gray-500">{new Date(step.date).toLocaleString()}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </Surface>
                    </Section>

                    {/* Provider Details */}
                    {worker && (
                        <Section>
                            <h3 className="font-bold text-gray-900 mb-3">Provider</h3>
                            <Surface className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                    {worker.imageUrl ? (
                                        <img src={worker.imageUrl} alt={worker.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <User size={20} className="text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{worker.name}</p>
                                    <p className="text-sm text-gray-500">★ {worker.rating} • {worker.reviewCount} reviews</p>
                                </div>
                            </Surface>
                        </Section>
                    )}

                    {/* Invoice / Payment Info could go here */}
                </main>
            </div>
        </AuthGuard>
    );
}
