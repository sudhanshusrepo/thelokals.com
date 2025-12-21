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

interface QuickCategoriesProps {
    onSelectCategory?: (categoryId: string) => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const { data, error } = await supabase
                    .from('service_categories')
                    .select('id, name, icon_url, image_url, emoji, display_order')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true })
                    .limit(9);

                if (error) throw error;

                // Map emoji from icon_url if emoji field doesn't exist
                const mappedData = (data || []).map(cat => ({
                    ...cat,
                    emoji: cat.emoji || cat.icon_url || '🏠'
                }));

                setCategories(mappedData);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to hardcoded data if DB fetch fails
                setCategories([
                    { id: 'ac', name: 'AC Repair', image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=200', emoji: '❄️', display_order: 1 },
                    { id: 'bike', name: 'Rental Bikes', image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=200', emoji: '🏍️', display_order: 2 },
                    { id: 'car', name: 'Rental Cars', image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=200', emoji: '🚗', display_order: 3 },
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

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
        <section className="relative -mt-8 pb-8 bg-gradient-to-b from-transparent via-background/50 to-background">
            <div className="max-w-7xl mx-auto px-4">
                {/* Scrollable Container */}
                <div className="overflow-x-auto scrollbar-hide pb-4">
                    <div className="flex gap-4 min-w-max">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => onSelectCategory?.(category.id)}
                                className="group flex flex-col items-center gap-2 w-20 focus:outline-none"
                            >
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all group-active:scale-95">
                                    {category.image_url ? (
                                        <>
                                            <img
                                                src={category.image_url}
                                                alt={category.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 group-hover:to-black/20 transition-colors"></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl drop-shadow-lg">{category.emoji}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-accent transition-colors">
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                    <div className="w-2 h-1 rounded-full bg-accent"></div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                </div>
            </div>
        </section>
    );
};
