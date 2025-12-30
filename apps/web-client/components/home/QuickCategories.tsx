'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { ServiceTile } from '../ui/ServiceTile';

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
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const numDots = Math.ceil(categories.length / 6);

        if (maxScroll <= 0 || numDots <= 1) {
            setActiveIndex(0);
            return;
        }

        const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
        const newIndex = Math.round(progress * (numDots - 1));
        setActiveIndex(newIndex);
    };

    useEffect(() => {
        async function fetchCategories() {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('display_order', { ascending: true });

                if (error) throw error;

                // Map emoji from icon_url if emoji field doesn't exist
                const mappedData: Category[] = (data || []).map((cat: SupabaseCategoryResponse): Category => {
                    return {
                        id: cat.id,
                        name: cat.name,
                        icon_url: cat.icon_url || undefined,
                        image_url: cat.image_url || undefined,
                        emoji: cat.icon || cat.icon_url || '🏠',
                        display_order: cat.display_order
                    };
                });

                setCategories(mappedData);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to hardcoded data if DB fetch fails
                setCategories([
                    { id: 'ac-repair', name: 'AC Repair', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200', emoji: '❄️', display_order: 0 },
                    { id: 'plumber', name: 'Plumbers', image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=200', emoji: '🔧', display_order: 1 },
                    { id: 'electrician', name: 'Electricians', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200', emoji: '⚡', display_order: 2 },
                    { id: 'cleaner', name: 'Cleaners', image_url: 'https://images.unsplash.com/photo-1581578731117-104f2a921a29?q=80&w=200', emoji: '🧹', display_order: 3 },
                    { id: 'carpenter', name: 'Carpenters', image_url: 'https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?q=80&w=200', emoji: '🪚', display_order: 4 },
                    { id: 'painter', name: 'Painters', image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=200', emoji: '🎨', display_order: 5 },
                    { id: 'gardener', name: 'Gardeners', image_url: 'https://images.unsplash.com/photo-1611735341450-74d61e66ee62?q=80&w=200', emoji: '🌿', display_order: 6 },
                ]);
            } finally {
                console.log('QuickCategories loading complete');
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
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
                    role="region"
                    aria-label="Category carousel"
                    style={{
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <div className="flex gap-4 min-w-max">
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                className={`snap-start transition-all duration-300 ${index === activeIndex
                                    ? 'scale-105'
                                    : 'scale-100'
                                    }`}
                                style={{
                                    filter: index === activeIndex
                                        ? 'drop-shadow(0 0 20px rgba(247, 200, 70, 0.6))'
                                        : 'none',
                                }}
                            >
                                <ServiceTile
                                    emoji={category.emoji}
                                    imageUrl={category.image_url}
                                    label={category.name}
                                    onClick={() => onSelectCategory?.(category.id)}
                                    variant="category"
                                    data-testid={`service-${category.id}`}
                                    className={`
                                        ${index === activeIndex ? 'ring-2 ring-accent-amber' : ''}
                                        transition-all duration-300
                                    `}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                    {[...Array(Math.ceil(categories.length / 6))].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-1.5 bg-neutral-300'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
