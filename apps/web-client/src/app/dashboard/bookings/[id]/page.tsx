'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { designTokensV2 } from '../../../../theme/design-tokens-v2';
import { ArrowLeft, Phone, MessageSquare, ShieldCheck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();

    // Mock Detail Data
    const booking = {
        id: params.id,
        serviceName: 'AC Deep Cleaning',
        status: 'assigned',
        date: 'Today, Oct 24',
        time: '02:00 PM',
        address: '1204, Tower B, Supertech Emerald, Sector 65, Gurugram',
        provider: {
            name: 'Rajesh Kumar',
            rating: 4.8,
            image: '/providers/p1.jpg',
            phone: '+91 98765 43210'
        },
        items: [
            { name: 'Split AC Deep Cleaning', price: 799, qty: 1 }
        ],
        total: 799
    };

    const steps = [
        { label: 'Booking Confirmed', completed: true, time: '10:30 AM' },
        { label: 'Pro Assigned', completed: true, time: '10:45 AM' },
        { label: 'Pro On the way', completed: false },
        { label: 'Service Started', completed: false },
        { label: 'Completed', completed: false },
    ];

    return (
        <div className="pb-10 min-h-screen bg-white md:bg-gray-50">
            {/* Header (Mobile) */}
            <div className="sticky top-0 bg-white z-10 p-4 flex items-center gap-4 shadow-sm md:hidden">
                <button onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-lg">Booking #{booking.id}</h1>
            </div>

            <div className="max-w-2xl mx-auto md:py-8">
                {/* Status Banner */}
                <div className="bg-white p-6 md:rounded-v2-card md:shadow-v2-card mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-v2-accent-success" />
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-v2-text-primary mb-1">Assigned</h2>
                            <p className="text-gray-500 text-sm">Your pro will arrive by {booking.time}</p>
                        </div>
                        <div className="p-2 bg-green-50 text-green-700 rounded-lg">
                            <Clock size={24} />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4 space-y-6 border-l-2 border-gray-100 ml-2">
                        {steps.map((step, i) => (
                            <div key={i} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${step.completed ? 'border-v2-accent-success bg-v2-accent-success' : 'border-gray-300'
                                    }`} />
                                <div className={`text-sm ${step.completed ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                </div>
                                {step.time && <div className="text-xs text-gray-500 mt-0.5">{step.time}</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Provider Card (Provider Blind Reveal) */}
                {booking.provider && (
                    <div className="bg-white p-5 md:rounded-v2-card md:shadow-v2-card mb-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Assigned Professional</div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
                                {/* <Image src={booking.provider.image} fill alt="" className="object-cover" /> */}
                                <div className="w-full h-full flex items-center justify-center bg-v2-accent-warning text-white font-bold text-xl">
                                    {booking.provider.name[0]}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-lg">{booking.provider.name}</div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span className="font-bold text-v2-accent-warning">★ {booking.provider.rating}</span>
                                    <span>• Verified Partner</span>
                                </div>
                            </div>
                            <button className="p-3 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors">
                                <Phone size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Service Details */}
                <div className="bg-white p-5 md:rounded-v2-card md:shadow-v2-card mb-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Service Details</div>
                    <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden">
                            {/* <Image src="/services/ac.jpg" fill alt="" className="object-cover" /> */}
                            <div className="w-full h-full bg-gray-200" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">{booking.serviceName}</div>
                            <div className="text-sm text-gray-500">{booking.items[0].name} x {booking.items[0].qty}</div>
                            <div className="text-sm font-bold mt-1">₹{booking.total}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                        <MapPin size={18} className="text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-600 w-3/4">
                            {booking.address}
                        </div>
                    </div>
                </div>

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
    );
}
