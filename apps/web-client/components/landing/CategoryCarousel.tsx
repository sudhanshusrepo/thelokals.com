import React from 'react';

export interface Category {
    id: string;
    label: string;
    image: string;
}

interface CategoryCarouselProps {
    categories?: Category[];
    onSelectCategory?: (id: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', label: 'AC Repair', image: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=2669&auto=format&fit=crop' },
    { id: '2', label: 'Cleaning', image: 'https://images.unsplash.com/photo-1581578731117-10452b7a7028?q=80&w=2670&auto=format&fit=crop' },
    { id: '3', label: 'Plumbing', image: 'https://images.unsplash.com/photo-1505798577917-a651a5d40318?q=80&w=2574&auto=format&fit=crop' },
    { id: '4', label: 'Electrician', image: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=2669&auto=format&fit=crop' },
    { id: '5', label: 'Salon', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2574&auto=format&fit=crop' },
    { id: '6', label: 'Painting', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2670&auto=format&fit=crop' },
];

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
    categories = DEFAULT_CATEGORIES,
    onSelectCategory
}) => {
    return (
        <div className="w-full py-2">
            {/* Scroll Container */}
            <div className="overflow-x-auto scrollbar-hide px-4 -mx-4 pb-4">
                <div className="flex gap-4 min-w-max">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory?.(cat.id)}
                            className="group flex flex-col items-center gap-3 w-20 sm:w-24 focus:outline-none"
                        >
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all group-active:scale-95 ring-2 ring-transparent group-focus-visible:ring-primary">
                                <img
                                    src={cat.image}
                                    alt={cat.label}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <span className="text-xs font-medium text-slate-700 text-center leading-tight group-hover:text-primary transition-colors">
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Pagination Dots (Deco) */}
            <div className="flex justify-center gap-1.5 mt-2">
                <div className="w-2 h-1 rounded-full bg-primary/80"></div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            </div>
        </div>
    );
};
