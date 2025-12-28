'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@thelocals/core/services/supabase';
import { ServiceTile } from '../ui/ServiceTile';

interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    gradient_colors?: string;
    display_order: number;
    // Local UI property
    type?: 'offline' | 'online';
}

interface BrowseServicesProps {
    onSelectService?: (serviceId: string) => void;
}

export default function BrowseServices({ onSelectService }: BrowseServicesProps) {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline');

    useEffect(() => {
        async function fetchServices() {
            try {
                const { data, error } = await supabase
                    .from('service_categories')
                    .select('id, name, description, image_url, gradient_colors, display_order')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (error) throw error;

                // Augment data with type for demo/inference
                const augmentedData = (data || []).map((item: ServiceCategory) => ({
                    ...item,
                    type: ['consultation', 'tutor', 'fitness', 'psychology', 'legal', 'lawyer'].some(k => item.id.includes(k) || item.name.toLowerCase().includes(k))
                        ? 'online'
                        : 'offline' as 'offline' | 'online'
                }));

                setServices(augmentedData);
            } catch (error) {
                console.error('Error fetching services:', error);
                // Fallback mock data
                setServices([
                    {
                        id: 'ac',
                        name: 'AC & Appliances',
                        description: 'AC repair • RO service • Fridge repair',
                        image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600',
                        gradient_colors: 'from-blue-500/80 to-cyan-500/80',
                        display_order: 1,
                        type: 'offline'
                    },
                    {
                        id: 'rides',
                        name: 'Rides (Bike & Cab)',
                        description: 'Bike taxi • Car rental • Airport transfer',
                        image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=600',
                        gradient_colors: 'from-orange-500/80 to-red-500/80',
                        display_order: 2,
                        type: 'offline'
                    },
                    {
                        id: 'consult-legal',
                        name: 'Legal Consultation',
                        description: 'Video calls with top lawyers.',
                        image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600',
                        gradient_colors: 'from-slate-700/80 to-slate-900/80',
                        display_order: 3,
                        type: 'online'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, []);

    const filteredServices = services.filter(s => (s.type || 'offline') === activeTab);

    if (loading) {
        return (
            <section className="py-12 md:py-16 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-8 space-y-4">
                        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-10 w-64 bg-slate-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-48 rounded-3xl bg-slate-200 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-background to-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header & Toggle */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
                            Browse Services
                        </h2>
                        <p className="text-neutral-500 text-sm md:text-base">
                            Trusted professionals for your every need.
                        </p>
                    </div>

                    {/* Segmented Control */}
                    <div className="flex bg-neutral-100 p-1.5 rounded-full self-start md:self-auto">
                        <button
                            onClick={() => setActiveTab('offline')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'offline'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            In-Person
                        </button>
                        <button
                            onClick={() => setActiveTab('online')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'online'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            Online
                        </button>
                    </div>
                </div>



                {/* Services Grid */}
                {filteredServices.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8"
                    >
                        {filteredServices.map((service) => (
                            <motion.div
                                key={service.id}
                                className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Badge - positioned absolutely over the tile */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-medium text-white border border-white/10">
                                        {activeTab === 'online' ? 'Video Call' : 'At Home'}
                                    </span>
                                </div>

                                <ServiceTile
                                    imageUrl={service.image_url}
                                    label={service.name}
                                    onClick={() => onSelectService?.(service.id)}
                                    variant="browse"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">No services found</h3>
                        <p className="text-neutral-500">We couldn't find any {activeTab} services right now.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
