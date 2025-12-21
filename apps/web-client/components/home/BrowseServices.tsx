'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';

interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    gradient_colors?: string;
    display_order: number;
}

interface BrowseServicesProps {
    onSelectService?: (serviceId: string) => void;
}

export const BrowseServices: React.FC<BrowseServicesProps> = ({ onSelectService }) => {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchServices() {
            try {
                const { data, error } = await supabase
                    .from('service_categories')
                    .select('id, name, description, image_url, gradient_colors, display_order')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (error) throw error;

                setServices(data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
                // Fallback to hardcoded data
                setServices([
                    {
                        id: 'ac',
                        name: 'AC & Appliances',
                        description: 'AC repair • RO service • Fridge repair',
                        image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600',
                        gradient_colors: 'from-blue-500/80 to-cyan-500/80',
                        display_order: 1
                    },
                    {
                        id: 'rides',
                        name: 'Rides (Bike & Cab)',
                        description: 'Bike taxi • Car rental • Airport transfer',
                        image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=600',
                        gradient_colors: 'from-orange-500/80 to-red-500/80',
                        display_order: 2
                    },
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, []);

    if (loading) {
        return (
            <section className="py-12 md:py-16 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            Browse Services
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-40 md:h-48 rounded-2xl bg-slate-200 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-background to-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Heading */}
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        Browse Services
                    </h2>
                    <p className="text-muted text-sm md:text-base">
                        Trusted professionals for all your home service needs
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {services.map((service) => {
                        const gradientClass = service.gradient_colors || 'from-indigo-500/80 to-purple-500/80';

                        return (
                            <button
                                key={service.id}
                                onClick={() => onSelectService?.(service.id)}
                                className="group relative h-44 md:h-52 rounded-2xl overflow-hidden shadow-elevated hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent active:scale-[0.98]"
                            >
                                {/* Background Image */}
                                {service.image_url && (
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                )}

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} group-hover:opacity-95 transition-opacity duration-300`}></div>

                                {/* Shine Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/20 transition-all duration-700"></div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-end p-5 text-white">
                                    <h3 className="font-bold text-lg md:text-xl mb-1.5 leading-tight drop-shadow-md">
                                        {service.name}
                                    </h3>
                                    {service.description && (
                                        <p className="text-xs md:text-sm text-white/95 leading-snug drop-shadow-sm">
                                            {service.description}
                                        </p>
                                    )}

                                    {/* Arrow Icon */}
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
