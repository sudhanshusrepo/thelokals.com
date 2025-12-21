import React from 'react';
import { SearchBar } from './SearchBar';

interface HeroSectionProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    backgroundImage?: string;
    onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    eyebrow = "Professional Local Services",
    title = "Expert help,\nright at your doorstep.",
    description = "Book trusted professionals for cleaning, repairs, and grooming instantly.",
    backgroundImage = "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2768&auto=format&fit=crop", // Placeholder Kitchen/Home Service image
    onSearch
}) => {
    return (
        <section className="relative w-full h-[460px] flex flex-col justify-end overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={backgroundImage}
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/30 via-slate-900/60 to-slate-900/90"></div>

            {/* Content */}
            <div className="relative z-20 px-6 pb-20 w-full max-w-md mx-auto text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold tracking-wide uppercase mb-4">
                    {eyebrow}
                </span>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-sm whitespace-pre-line">
                    {title}
                </h1>

                <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed mb-8 max-w-xs mx-auto drop-shadow-sm">
                    {description}
                </p>

                {/* Search Bar - Positioned slightly overlapping or just at the bottom */}
                <div className="transform translate-y-8">
                    <SearchBar onSubmit={onSearch} />
                </div>
            </div>
        </section>
    );
};
