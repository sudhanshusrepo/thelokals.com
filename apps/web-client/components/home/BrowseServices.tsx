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
        <section className="py-12 md:py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4">
                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Browse Services
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {services.map((service) => {
                        const gradientClass = service.gradient_colors || 'from-indigo-500/80 to-purple-500/80';

                        return (
                            <button
                                key={service.id}
                                onClick={() => onSelectService?.(service.id)}
                                className="group relative h-40 md:h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                {/* Background Image */}
                                {service.image_url && (
                                    <img
                                        src={service.image_url}
                                        alt={service.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                )}

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} group-hover:opacity-90 transition-opacity`}></div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-end p-4 text-white">
                                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                                        {service.name}
                                    </h3>
                                    {service.description && (
                                        <p className="text-xs text-white/90 leading-snug">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
