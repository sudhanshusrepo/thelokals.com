'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@thelocals/platform-core/services/adminService';
import { ServiceCategory } from '@thelocals/platform-core/types';
import { ServiceCard } from '../../components/v2/ServiceCard';
import { designTokensV2 } from '../../theme/design-tokens-v2';
import { ChevronLeft, Search } from 'lucide-react';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export default function ServicesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredCategories(categories);
            return;
        }

        const timeoutId = setTimeout(() => {
            const query = searchQuery.toLowerCase();
            const filtered = categories.filter(cat =>
                (cat.name || '').toLowerCase().includes(query) ||
                (cat.description || '').toLowerCase().includes(query)
            );
            setFilteredCategories(filtered);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, categories]);

    const loadData = async () => {
        try {
            const cats = await adminService.getServiceCategories();
            setCategories(cats);
            setFilteredCategories(cats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 pb-24">
                {/* Header */}
                <header className="bg-white sticky top-0 z-40 px-6 py-4 flex items-center gap-4 shadow-sm">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">All Services</h1>
                </header>

                <main className="px-6 py-6">
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for a service..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-v2-primary"
                        />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-56 bg-gray-200 rounded-v2-card animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map(cat => (
                                    <ServiceCard
                                        key={cat.id}
                                        service={{
                                            id: cat.id,
                                            name: cat.name,
                                            image: '/services/ac.jpg',
                                            price: cat.base_price || 499,
                                            rating: 4.8,
                                            reviews: 120
                                        }}
                                        onClick={(id) => router.push(`/services/${id}`)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-12 text-gray-500">
                                    No services found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </ErrorBoundary>
    );
}
