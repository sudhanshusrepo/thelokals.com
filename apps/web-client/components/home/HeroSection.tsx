'use client';

import React, { useState } from 'react';

interface HeroSectionProps {
    onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = [
        'AC not cooling',
        'Bike taxi near me',
        'Electrician for wiring',
        'Deep home cleaning',
        'Car wash at home',
        'Yoga instructor'
    ];

    const handleSearch = (query: string) => {
        onSearch?.(query);
        setShowSuggestions(false);
    };

    return (
        <section className="relative w-full h-[55vh] min-h-[400px] flex items-end overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2673&auto=format&fit=crop"
                    alt="Local services"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 gradient-hero-overlay"></div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-28 md:pb-32">
                {/* Eyebrow */}
                <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold tracking-wide">
                        Get STUFF done! 😊
                    </span>
                </div>

                {/* Heading */}
                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 leading-tight">
                    Trusted Local Services,<br />One Tap Away
                </h1>

                {/* Subtext */}
                <p className="text-white/90 text-center text-base md:text-lg mb-8 max-w-2xl mx-auto">
                    Book verified providers for AC repair, Car/Bike rentals, vehicle wash, cleaning, yoga and more in your neighborhood.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(e.target.value.length > 0);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    handleSearch(searchQuery);
                                }
                            }}
                            placeholder="Search for a service or issue (AC not cooling, cab, electrician…)"
                            className="w-full pl-12 pr-16 py-4 md:py-5 bg-white text-foreground placeholder:text-muted rounded-[25px] shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm md:text-base font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>
                            <div className="w-px h-6 bg-slate-200"></div>
                            <span className="text-xs font-bold text-accent px-2">AI</span>
                        </div>
                    </div>

                    {/* Typeahead Suggestions */}
                    {showSuggestions && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in-up">
                            {suggestions
                                .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
                                .slice(0, 5)
                                .map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSearchQuery(suggestion);
                                            handleSearch(suggestion);
                                        }}
                                        className="w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                                    >
                                        <svg className="w-4 h-4 text-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-foreground">{suggestion}</span>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
