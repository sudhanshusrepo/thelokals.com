'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';

interface Category {
    id: string;
    name: string;
    icon_url?: string;
    image_url?: string;
    emoji?: string;
    display_order: number;
}

interface SupabaseCategoryResponse {
    id: string;
    name: string;
    icon_url?: string | null;
    image_url?: string | null;
    icon?: string | null;
    display_order: number;
}

interface QuickCategoriesProps {
    onSelectCategory?: (categoryId: string) => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchCategories() {
            try {
                const { data, error } = await supabase
                    .from('service_categories')
                    .select('id, name, icon_url, image_url, icon, display_order')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true })
                    .limit(15); // Increased from 9 to 15

                if (error) throw error;

                // Map emoji from icon_url if emoji field doesn't exist
                const mappedData: Category[] = (data || []).map((cat: SupabaseCategoryResponse): Category => ({
                    id: cat.id,
                    name: cat.name,
                    icon_url: cat.icon_url || undefined,
                    image_url: cat.image_url || undefined,
                    emoji: cat.icon || cat.icon_url || '🏠',
                    display_order: cat.display_order
                }));

                setCategories(mappedData);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to hardcoded data if DB fetch fails
                setCategories([
                    { id: 'ac', name: 'AC Repair', image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=200', emoji: '❄️', display_order: 1 },
                    { id: 'plumbing', name: 'Plumbing', image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=200', emoji: '🔧', display_order: 2 },
                    { id: 'electrical', name: 'Electrician', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200', emoji: '⚡', display_order: 3 },
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const handleImageLoad = (categoryId: string) => {
        setLoadedImages(prev => new Set(prev).add(categoryId));
    };

    if (loading) {
        return (
            <section className="relative -mt-8 pb-8 bg-gradient-to-b from-transparent via-background/50 to-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="overflow-x-auto scrollbar-hide pb-4">
                        <div className="flex gap-4 min-w-max">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 w-20">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-200 animate-pulse"></div>
                                    <div className="w-16 h-3 rounded bg-slate-200 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className="relative -mt-12 pb-8 bg-gradient-to-b from-transparent via-background/50 to-background z-30"
            aria-label="Popular service categories"
        >
            <div className="max-w-7xl mx-auto px-4">
                <div
                    className="overflow-x-auto scrollbar-hide pb-4"
                    role="region"
                    aria-label="Category carousel"
                >
                    <div className="flex gap-4 min-w-max">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onSelectCategory?.(category.id)}
                                className="flex flex-col items-center gap-2 w-20 group"
                                aria-label={`Browse ${category.name} services`}
                            >
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-elevated">
                                    {/* Emoji Placeholder - shown until image loads */}
                                    {!loadedImages.has(category.id) && category.emoji && (
                                        <div className="absolute inset-0 flex items-center justify-center text-3xl bg-gradient-to-br from-accent/10 to-primary/10">
                                            {category.emoji}
                                        </div>
                                    )}

                                    {/* Image */}
                                    {category.image_url && (
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            onLoad={() => handleImageLoad(category.id)}
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages.has(category.id) ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        />
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <span className="text-xs font-semibold text-foreground text-center leading-tight max-w-[80px] group-hover:text-accent transition-colors">
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                    {[...Array(Math.ceil(categories.length / 6))].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-6 bg-accent' : 'w-1.5 bg-slate-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
