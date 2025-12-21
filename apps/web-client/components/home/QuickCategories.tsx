'use client';

import React from 'react';

interface Category {
    id: string;
    label: string;
    image: string;
    emoji: string;
}

const categories: Category[] = [
    { id: 'ac', label: 'AC Repair', image: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=200', emoji: '❄️' },
    { id: 'bike', label: 'Rental Bikes', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=200', emoji: '🏍️' },
    { id: 'car', label: 'Rental Cars', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=200', emoji: '🚗' },
    { id: 'electrician', label: 'Electrician', image: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=200', emoji: '⚡' },
    { id: 'cleaning', label: 'Home Cleaning', image: 'https://images.unsplash.com/photo-1581578731117-10452b7a7028?q=80&w=200', emoji: '🧹' },
    { id: 'salon', label: 'Salon at Home', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200', emoji: '💇' },
    { id: 'carwash', label: 'Car Wash', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=200', emoji: '🚿' },
    { id: 'bikewash', label: 'Bike Wash', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=200', emoji: '💦' },
    { id: 'yoga', label: 'Yoga Session', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200', emoji: '🧘' },
];

interface QuickCategoriesProps {
    onSelectCategory?: (categoryId: string) => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({ onSelectCategory }) => {
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
                                    <img
                                        src={category.image}
                                        alt={category.label}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 group-hover:to-black/20 transition-colors"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl drop-shadow-lg">{category.emoji}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-foreground text-center leading-tight group-hover:text-accent transition-colors">
                                    {category.label}
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
