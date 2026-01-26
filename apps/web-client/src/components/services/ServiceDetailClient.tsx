'use client';

import React from 'react';
import { ServiceCategory } from '@thelocals/platform-core';
import { ArrowLeft, Star, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getServiceImage } from '../../lib/images';

interface ServiceDetailClientProps {
    service: ServiceCategory;
}

export function ServiceDetailClient({ service }: ServiceDetailClientProps) {
    const router = useRouter();

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h2>
                    <p className="text-gray-500 mb-4">The service you are looking for does not exist.</p>
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-lokals-green text-black font-bold rounded-lg">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const handleBook = () => {
        router.push(`/book?category_id=${service.id}`);
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Hero Header */}
            <div className="relative h-[300px] w-full">
                <img
                    src={getServiceImage(service.name)}
                    alt={service.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />

                <div className="absolute top-0 left-0 p-4 w-full">
                    <button onClick={() => router.back()} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-6 -mt-12 relative z-10">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold uppercase">Starts at</p>
                            <p className="text-xl font-bold text-lokals-green">₹{service.base_price || 499}</p>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1 font-bold text-lokals-yellow">
                            <Star size={14} className="fill-lokals-yellow" /> 4.8 (120)
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> 60 mins
                        </span>
                    </div>

                    <div className="h-px bg-gray-100 w-full mb-6" />

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        <h3 className="font-bold text-gray-900">What's Included</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 size={18} className="text-lokals-green" />
                                <span>Professional Service</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 size={18} className="text-lokals-green" />
                                <span>Post-service cleanup</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 size={18} className="text-lokals-green" />
                                <span>Masks & Gloves ensured</span>
                            </li>
                        </ul>
                    </div>

                    {/* Safety Badge */}
                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3 border border-green-100">
                        <ShieldCheck size={24} className="text-green-600" />
                        <div>
                            <p className="font-bold text-green-900 text-sm">Verified Professionals</p>
                            <p className="text-xs text-green-700">Background checked & trained.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleBook}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all hover:bg-gray-800"
                    >
                        Book Service
                    </button>
                </div>
            </div>
        </div>
    );
}
