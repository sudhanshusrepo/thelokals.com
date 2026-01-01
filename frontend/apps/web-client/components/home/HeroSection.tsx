'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import toast from 'react-hot-toast';
import { LokalsAIPill } from './LokalsAIPill';

interface HeroSectionProps {
    onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Mic / Speech Integration
    const { isListening, transcript, error: speechError, startListening, stopListening, isSupported: isSpeechSupported } = useSpeechRecognition();

    // Update search query when transcript changes
    useEffect(() => {
        if (transcript) {
            setSearchQuery(transcript);
        }
    }, [transcript]);

    // Handle speech errors
    useEffect(() => {
        if (speechError === 'permission-denied') {
            toast.error('Microphone permission required for voice search.', {
                position: 'bottom-center',
                duration: 4000
            });
        } else if (speechError === 'not-supported') {
            toast('Voice search is not available on this browser.', {
                icon: '⚠️',
                position: 'bottom-center'
            });
        }
    }, [speechError]);

    const handleMicClick = () => {
        if (!isSpeechSupported) {
            toast('Voice search is not available on this browser.', { icon: '⚠️' });
            return;
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
            toast('Listening...', { icon: '🎙️', duration: 2000, position: 'bottom-center' });
        }
    };

    // Camera / File Integration
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Stub functionality for Sprint 2
            toast.success(`Selected: ${file.name}`, { duration: 3000, position: 'bottom-center' });
            // Simulate processing / triggers search
            handleSearch(`Analyzing ${file.name}...`);
        }
    };

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

    // Determine AI pill state based on listening status
    const aiPillState = isListening ? 'listening' : (searchQuery.length > 0 ? 'searching' : 'idle');

    return (
        <section className="relative w-full h-[55vh] min-h-[400px] flex items-end overflow-hidden rounded-b-3xl shadow-hero">
            {/* Navy Gradient Background (replaces photo) */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary via-secondary-light to-secondary animate-gradient-xy">
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            </div>

            {/* Gradient Overlay for depth */}
            <div className="absolute inset-0 z-10 gradient-hero-overlay"></div>

            {/* Content */}
            <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-28 md:pb-32">
                {/* Eyebrow - Hidden on mobile */}
                <div className="text-center mb-4 hidden md:block">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-semibold tracking-wide">
                        get STUFF done! 😎
                    </span>
                </div>

                {/* Heading - Hidden on mobile */}
                <h1 className="hidden md:block text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 leading-tight">
                    Trusted Local Services,<br />One Tap Away
                </h1>

                {/* Subtext - Hidden on mobile */}
                <p className="hidden md:block text-white/90 text-center text-base md:text-lg mb-8 max-w-2xl mx-auto">
                    Book verified providers for AC repair, Car/Bike rentals, vehicle wash, cleaning, yoga and more in your neighborhood.
                </p>

                {/* Lokals AI Pill - Positioned above search bar */}
                <div className="flex justify-center mb-3">
                    <LokalsAIPill state={aiPillState} />
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        placeholder="Search for a service or issue..."
                        className="w-full pl-12 pr-32 py-4 md:py-5 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 rounded-full border-2 border-primary/20 focus:border-primary shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm md:text-base font-medium transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                        {/* Mic Icon */}
                        {/* Mic Icon */}
                        <button
                            onClick={handleMicClick}
                            disabled={isListening && speechError === 'permission-denied'}
                            className={`p-3 hover:bg-neutral-50 rounded-full transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-100' : 'text-primary'}`}
                            title="Search by voice"
                        >
                            {isListening ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>
                        <div className="w-px h-6 bg-neutral-200"></div>
                        {/* Camera Icon */}
                        <button
                            onClick={handleCameraClick}
                            className="p-3 hover:bg-neutral-50 rounded-full transition-colors text-primary"
                            title="Search by image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        {/* Hidden File Input for Camera/Gallery */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,video/*"
                            capture="environment" // Prefers rear camera on mobile
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {/* Typeahead Suggestions */}
                {showSuggestions && (
                    <div className="absolute top-full mt-2 w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 animate-fade-in-up">
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
                                    className="w-full px-5 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3 group"
                                >
                                    <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-foreground">{suggestion}</span>
                                </button>
                            ))}
                    </div>
                )}

                {/* POST LIVE REQUEST CTA */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {
                            // Navigate to live request creation flow
                            // For now, we'll use the search as a placeholder
                            if (searchQuery.trim()) {
                                handleSearch(searchQuery);
                            } else {
                                // Show a prompt to enter service details
                                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                if (input) {
                                    input.focus();
                                    input.placeholder = "What service do you need? (e.g., AC repair)";
                                }
                            }
                        }}
                        className="group relative px-8 py-4 bg-accent-amber hover:bg-warning text-secondary font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3"
                        style={{ fontSize: '18px', minHeight: '48px' }}
                        data-testid="post-live-request-btn"
                    >
                        <span className="relative z-10">POST LIVE REQUEST</span>
                        <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-accent-amber rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
                    </button>
                </div>
            </div>
        </section>
    );
};
