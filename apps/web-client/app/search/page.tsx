'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';

interface Service {
    code: string;
    name: string;
    description?: string;
    category_id?: string;
    base_price_cents?: number;
}

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResults() {
            if (!query) {
                setLoading(false);
                return;
            }

            try {
                const searchTerm = query.trim().toLowerCase();
                const { data, error } = await supabase
                    .from('services')
                    .select('code, name, description, category_id, base_price_cents')
                    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                    .eq('is_active', true)
                    .limit(20);

                if (error) throw error;
                setServices(data || []);
            } catch (error) {
                console.error('Search error:', error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    const handleServiceClick = (code: string) => {
        router.push(`/service/${code}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
                        >
                            <span className="text-xl">←</span>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-foreground">Searching...</h1>
                        </div>
                    </div>
                </div>

                {/* Loading Skeleton */}
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <span className="text-xl">←</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-foreground">
                            {services.length > 0
                                ? `${services.length} result${services.length !== 1 ? 's' : ''} for "${query}"`
                                : `No results for "${query}"`
                            }
                        </h1>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {services.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No services found</h2>
                        <p className="text-muted mb-6">
                            Try searching for something else or browse our categories
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-accent text-white px-6 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors"
                        >
                            Browse Categories
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {services.map((service) => (
                            <button
                                key={service.code}
                                onClick={() => handleServiceClick(service.code)}
                                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left group"
                            >
                                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                                    {service.name}
                                </h3>
                                {service.description && (
                                    <p className="text-sm text-muted mb-2 line-clamp-2">
                                        {service.description}
                                    </p>
                                )}
                                {service.base_price_cents && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-accent">
                                            ₹{(service.base_price_cents / 100).toFixed(0)}
                                        </span>
                                        <span className="text-xs text-muted">onwards</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
