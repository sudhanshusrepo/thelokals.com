'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppBar } from '../../components/home/AppBar';
import { Footer } from '../../components/home/Footer';
import { supabase } from '@thelocals/core/services/supabase';

interface Service {
    code: string;
    name: string;
    description?: string;
    base_price_cents?: number;
    service_category_id?: string;
    is_active: boolean;
}

export default function BrowseContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchServices() {
            try {
                let query = supabase
                    .from('services')
                    .select('code, name, description, base_price_cents, service_category_id, is_active')
                    .eq('is_active', true)
                    .order('name');

                if (categoryParam) {
                    query = query.eq('service_category_id', categoryParam);
                }

                const { data, error } = await query;

                if (error) throw error;
                setServices(data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, [categoryParam]);

    const handleServiceClick = (serviceCode: string) => {
        router.push(`/service/${serviceCode}`);
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
                                {categoryParam ? 'Category Services' : 'Browse Services'}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                {loading ? 'Loading...' : `${services.length} services available`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Service Grid */}
                {loading ? (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                                <div className="w-full h-48 bg-slate-200"></div>
                                <div className="p-5">
                                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
                                    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <div
                                key={service.code}
                                onClick={() => handleServiceClick(service.code)}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100"
                            >
                                {/* Placeholder Image */}
                                <div className="relative overflow-hidden w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50">
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                        🛠️
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                                        {service.name}
                                    </h3>

                                    {service.description && (
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                            {service.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        {service.base_price_cents ? (
                                            <div className="text-indigo-600 font-bold">
                                                ₹{(service.base_price_cents / 100).toFixed(0)}
                                                <span className="text-slate-400 text-xs font-normal"> onwards</span>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 text-sm">Price on request</div>
                                        )}
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
                        <p className="text-slate-500">
                            {categoryParam
                                ? `We couldn't find any services in this category.`
                                : 'No services are currently available.'}
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-indigo-600 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
