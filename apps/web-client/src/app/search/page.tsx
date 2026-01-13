'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingService, ServiceCategory } from '@thelocals/platform-core';
import { getServiceImageUrl } from '../../utils/imageUtils';
import { ServiceCard } from '../../components/v2/ServiceCard';
import { Search, Filter, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Surface } from '../../components/ui/Wrappers';

// --- Types ---
// Borrowing from platform-core but simplifying for display
interface DisplayService {
    id: string;
    name: string;
    image: string;
    price: number;
    rating: number;
    reviews: number;
    category?: string;
    isBestMatch?: boolean;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    // Local state for filters
    const [searchTerm, setSearchTerm] = useState(query);
    const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high'>('relevance');

    const [allServices, setAllServices] = useState<DisplayService[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Fetch Real Categories via BookingService to ensuring UUIDs are correct
    useEffect(() => {
        const loadServices = async () => {
            try {
                // Fetch categories serving as "Services" for search
                // In a real scenario, this might search full items + categories
                const categories = await bookingService.getServiceCategories();

                if (categories) {
                    const mapped = categories.map((cat: any) => ({
                        id: cat.id,
                        name: cat.name,
                        image: getServiceImageUrl(cat.name),
                        price: 299, // Base start price generic
                        rating: 4.8,
                        reviews: 150,
                        category: 'general'
                    }));
                    setAllServices(mapped);
                }
            } catch (e) {
                console.error("Search fetch failed", e);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadServices();
    }, []);

    const filteredServices = React.useMemo(() => {
        if (!searchTerm) return allServices;

        let results = allServices.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sorting
        if (sortBy === 'price_low') {
            results.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_high') {
            results.sort((a, b) => b.price - a.price);
        }

        return results;
    }, [searchTerm, allServices, sortBy]);


    // Update URL on search (debounced slightly in real app, here direct)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set('q', searchTerm);
        } else {
            params.delete('q');
        }
        router.replace(`/search?${params.toString()}`);

        // Save to recent searches
        if (searchTerm.trim()) {
            const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
            const updated = [searchTerm, ...recent.filter((s: string) => s !== searchTerm)].slice(0, 5);
            localStorage.setItem('recent_searches', JSON.stringify(updated));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-4 py-3">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <button type="button" onClick={() => router.back()} className="text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search services..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lokals-green/50 transition-all font-medium"
                            autoFocus
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </form>

                {/* Filters Row */}
                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium bg-white whitespace-nowrap">
                        <Filter size={12} /> Filters
                    </button>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium bg-white outline-none"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                    </select>
                </div>
            </header>

            {/* Results */}
            <main className="p-4">
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredServices.map(service => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onClick={() => router.push(`/services/${service.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
                        <p className="text-gray-500 text-sm">Try searching for "cleaning" or "repair"</p>

                        {/* Recent Searches suggestion could go here if query is empty/failed */}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
