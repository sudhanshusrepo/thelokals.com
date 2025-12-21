'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';

interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
}

interface Service {
    code: string;
    name: string;
    description?: string;
    base_price_cents?: number;
    duration_minutes_min?: number;
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<ServiceCategory | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategoryAndServices() {
            try {
                // Fetch category details
                const { data: categoryData, error: categoryError } = await supabase
                    .from('service_categories')
                    .select('id, name, description, image_url')
                    .eq('id', categoryId)
                    .single();

                if (categoryError) throw categoryError;
                setCategory(categoryData);

                // Fetch services in this category
                const { data: servicesData, error: servicesError } = await supabase
                    .from('services')
                    .select('code, name, description, base_price_cents, duration_minutes_min')
                    .eq('category_id', categoryId)
                    .eq('is_active', true)
                    .order('name');

                if (servicesError) throw servicesError;
                setServices(servicesData || []);
            } catch (error) {
                console.error('Error fetching category:', error);
                setCategory(null);
                setServices([]);
            } finally {
                setLoading(false);
            }
        }

        fetchCategoryAndServices();
    }, [categoryId]);

    const handleServiceClick = (code: string) => {
        router.push(`/service/${code}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header Skeleton */}
                <div className="relative h-48 bg-slate-200 animate-pulse"></div>

                {/* Content Skeleton */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🤷</div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Category not found</h2>
                    <p className="text-muted mb-6">
                        This category doesn't exist or has been removed
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Header */}
            <div className="relative h-48 overflow-hidden">
                {category.image_url ? (
                    <>
                        <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                >
                    <span className="text-white text-xl">←</span>
                </button>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
                    {category.description && (
                        <p className="text-white/90 text-sm">{category.description}</p>
                    )}
                </div>
            </div>

            {/* Services List */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {services.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No services available</h2>
                        <p className="text-muted mb-6">
                            Services in this category are coming soon
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors"
                        >
                            Browse Other Categories
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-foreground">
                                {services.length} service{services.length !== 1 ? 's' : ''} available
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service) => (
                                <button
                                    key={service.code}
                                    onClick={() => handleServiceClick(service.code)}
                                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-left group border border-slate-100"
                                >
                                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                                        {service.name}
                                    </h3>
                                    {service.description && (
                                        <p className="text-sm text-muted mb-3 line-clamp-2">
                                            {service.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        {service.base_price_cents && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-accent">
                                                    ₹{(service.base_price_cents / 100).toFixed(0)}
                                                </span>
                                                <span className="text-xs text-muted">onwards</span>
                                            </div>
                                        )}
                                        {service.duration_minutes_min && (
                                            <div className="flex items-center gap-1 text-xs text-muted">
                                                <span>⏱</span>
                                                <span>{service.duration_minutes_min} mins</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
