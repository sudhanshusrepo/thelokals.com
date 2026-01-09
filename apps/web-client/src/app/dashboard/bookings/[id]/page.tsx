'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageSquare, Clock, MapPin } from 'lucide-react';
import { Surface, Section } from '../../../../components/ui/Wrappers';
import { bookingService } from '@thelocals/platform-core/services/bookingService';
import { Booking } from '@thelocals/platform-core/types';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getBookingDetails(id);
            setBooking(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !booking) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Booking not found'}</div>;

    // Map DB status to UI steps
    const steps = [
        { label: 'Booking Confirmed', completed: ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'PAID'].includes(booking.status), time: new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { label: 'Pro Assigned', completed: ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'PAID'].includes(booking.status), time: '' },
        { label: 'Pro On the way', completed: ['EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'PAID'].includes(booking.status) },
        { label: 'Service Started', completed: ['IN_PROGRESS', 'COMPLETED', 'PAID'].includes(booking.status) },
        { label: 'Completed', completed: ['COMPLETED', 'PAID'].includes(booking.status) },
    ];

    const serviceName = (booking as any).service_category_id || 'Service'; // Fallback if join is missing name
    const provider = (booking as any).worker;
    const bookingDate = new Date(booking.created_at).toLocaleDateString();
    const bookingTime = new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="pb-10 min-h-screen bg-white md:bg-gray-50">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
                {/* Header (Mobile) */}
                <div className="sticky top-0 bg-white z-10 p-4 flex items-center gap-4 shadow-sm md:hidden">
                    <button onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-lg">Booking #{booking.id.slice(0, 8)}</h1>
                </div>

                <div className="max-w-2xl mx-auto md:py-8">
                    {/* Status Banner */}
                    <Surface elevated className="p-6 mb-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-lokals-green" />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1 capitalize">{booking.status.replace('_', ' ').toLowerCase()}</h2>
                                <p className="text-gray-500 text-sm">Scheduled for {bookingDate} at {bookingTime}</p>
                            </div>
                            <div className="p-2 bg-green-50 text-lokals-green rounded-lg">
                                <Clock size={24} />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-4 space-y-6 border-l-2 border-gray-100 ml-2">
                            {steps.map((step, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${step.completed ? 'border-lokals-green bg-lokals-green' : 'border-gray-300'
                                        }`} />
                                    <div className={`text-sm ${step.completed ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </div>
                                    {step.time && step.completed && <div className="text-xs text-gray-500 mt-0.5">{step.time}</div>}
                                </div>
                            ))}
                        </div>
                    </Surface>

                    {/* Provider Card (Provider Blind Reveal) */}
                    {provider ? (
                        <Surface elevated className="p-5 mb-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Assigned Professional</div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
                                    {/* <Image src={provider.avatar_url} fill alt="" className="object-cover" /> */}
                                    <div className="w-full h-full flex items-center justify-center bg-lokals-yellow text-white font-bold text-xl">
                                        {provider.full_name?.[0] || 'P'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg">{provider.full_name || 'Provider'}</div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <span className="font-bold text-lokals-yellow">★ {provider.rating || 4.8}</span>
                                        <span>• Verified Partner</span>
                                    </div>
                                </div>
                                <button className="p-3 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors">
                                    <Phone size={20} />
                                </button>
                            </div>
                        </Surface>
                    ) : (
                        <Surface elevated className="p-5 mb-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Provider Check</div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lokals-green"></div>
                                <span>Assigning best pro...</span>
                            </div>
                        </Surface>
                    )}

                    {/* Service Details */}
                    <Surface elevated className="p-5 mb-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Service Details</div>
                        <div className="flex gap-4 mb-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden">
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{serviceName}</div>
                                <div className="text-sm text-gray-500">Booking ID: {booking.id.slice(0, 8)}</div>
                                <div className="text-sm font-bold mt-1">₹{booking.final_cost || booking.estimated_cost || 0}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                            <MapPin size={18} className="text-gray-400 mt-0.5" />
                            <div className="text-sm text-gray-600 w-3/4">
                                {/* Ideally parse address json */}
                                {(booking.address as any)?.details || 'Address details'}
                            </div>
                        </div>
                    </Surface>

                    {/* Support Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-v2-card shadow-sm border border-gray-100 text-gray-700 font-medium">
                            <MessageSquare size={20} />
                            Help
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-v2-card shadow-sm border border-gray-100 text-red-500 font-medium">
                            Cancel Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
