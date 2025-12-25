'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppBar } from '../../components/home/AppBar';
import { Footer } from '../../components/home/Footer';

interface Service {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    priceStart: string;
    type: 'online' | 'offline';
    description?: string;
}

const services: Service[] = [
    { id: '1', name: 'AC Repair & Service', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069', rating: 4.8, reviews: 120, priceStart: '₹499', type: 'offline', description: 'Expert AC repair and servicing at your doorstep.' },
    { id: '2', name: 'Bathroom Cleaning', image: 'https://images.unsplash.com/photo-1581578731117-104f2a921a29?q=80&w=200', rating: 4.9, reviews: 85, priceStart: '₹399', type: 'offline', description: 'Deep cleaning for sparkling bathrooms.' },
    { id: '3', name: 'Salon for Men', image: 'https://images.unsplash.com/photo-1503951914875-befea74701c5?q=80&w=2068', rating: 4.7, reviews: 200, priceStart: '₹299', type: 'offline', description: 'Haircut, grooming, and spa services.' },
    { id: '4', name: 'Electrician', image: 'https://images.unsplash.com/photo-1621905252507-b35a5db01de8?q=80&w=2069', rating: 4.6, reviews: 90, priceStart: '₹199', type: 'offline', description: 'Electrical repairs and installations.' },
    { id: '5', name: 'Online Yoga Class', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=2000', rating: 5.0, reviews: 40, priceStart: '₹500', type: 'online', description: 'Live interactive yoga sessions.' },
    { id: '6', name: 'Legal Consultant', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000', rating: 4.9, reviews: 15, priceStart: '₹1000', type: 'online', description: 'Expert legal advice via video call.' },
];

export default function BrowseContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const [mode, setMode] = useState<'online' | 'offline'>('offline');

    const filteredServices = services.filter(s => {
        const matchesMode = s.type === mode;
        const matchesCategory = categoryParam ? s.name.toLowerCase().includes(categoryParam.toLowerCase()) : true;
        return matchesMode && matchesCategory;
    });

    const handleServiceClick = (serviceId: string) => {
        // Navigate to service detail page (assuming generic booking/service flow)
        // For now pointing to checkouts or existing service route
        router.push(`/service/${serviceId}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AppBar />

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 transition-colors shadow-sm text-slate-600"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {categoryParam ? `${categoryParam}` : 'Browse Services'}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {filteredServices.length} {mode} services available
                            </p>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex w-full md:w-auto">
                        <button
                            onClick={() => setMode('offline')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'offline'
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Offline (In-Person)
                        </button>
                        <button
                            onClick={() => setMode('online')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'online'
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Online (Remote)
                        </button>
                    </div>
                </div>

                {/* Service Grid */}
                {filteredServices.length > 0 ? (
                    <div className={`grid gap-6 ${mode === 'offline' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredServices.map((service) => (
                            <div
                                key={service.id}
                                onClick={() => handleServiceClick(service.id)}
                                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 ${mode === 'online' ? 'flex flex-col md:flex-row items-center p-4 gap-6' : ''
                                    }`}
                            >
                                {/* Image */}
                                <div className={`relative overflow-hidden ${mode === 'online' ? 'w-full md:w-48 h-48 md:h-32 rounded-xl flex-shrink-0' : 'w-full h-48'}`}>
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {mode === 'offline' && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                                            <span>⭐</span> {service.rating} ({service.reviews})
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`p-5 ${mode === 'online' ? 'flex-1 p-0' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {service.name}
                                        </h3>
                                        {mode === 'online' && (
                                            <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                                                <span>⭐</span> {service.rating}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="text-indigo-600 font-bold">
                                            {service.priceStart}
                                            <span className="text-slate-400 text-xs font-normal"> / session</span>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg group-hover:bg-indigo-600 transition-colors">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
                        <p className="text-slate-500">We couldn't find any {mode} services for "{categoryParam}".</p>
                        <button
                            onClick={() => {
                                router.push('/browse');
                            }}
                            className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-indigo-600 transition-colors"
                        >
                            View All Services
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
