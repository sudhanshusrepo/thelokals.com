'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { User, MapPin, Mic } from 'lucide-react';

interface AppBarProps {
    onSignIn?: () => void;
    onOpenApp?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AppBar: React.FC<AppBarProps> = ({ onSignIn, onOpenApp }) => {
    const { user } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [location, setLocation] = useState<string>('Detecting location...');
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Location detection
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const detectLocation = async () => {
            try {
                if (!navigator.geolocation) {
                    setLocation('Narnaund, Haryana');
                    setIsLoadingLocation(false);
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        // Use reverse geocoding to get city name
                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                            );
                            const data = await response.json();
                            const city = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
                            const state = data.address?.state || '';
                            setLocation(state ? `${city}, ${state}` : city);
                        } catch (error) {
                            setLocation('Your Location');
                        }
                        setIsLoadingLocation(false);
                    },
                    (error) => {
                        console.error('Location error:', error);
                        setLocation('Narnaund, Haryana'); // Default location
                        setIsLoadingLocation(false);
                    },
                    { timeout: 5000, enableHighAccuracy: false }
                );
            } catch (error) {
                setLocation('Narnaund, Haryana');
                setIsLoadingLocation(false);
            }
        };

        detectLocation();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt && onOpenApp) {
            onOpenApp();
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    return (
        <header
            className={`sticky top-0 z-50 h-[66px] gradient-primary transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-primary/10' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.jpg"
                        alt="lokals logo"
                        width={40}
                        height={40}
                        priority
                        className="rounded-lg"
                    />
                    <span className="text-white font-bold text-lg tracking-tight">lokals</span>
                </Link>

                {/* Center: Location Pill + Mic Button */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Location Pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                        <MapPin size={16} className="text-white" />
                        <span className="text-white text-sm font-medium max-w-[200px] truncate">
                            {isLoadingLocation ? (
                                <span className="animate-pulse">Detecting...</span>
                            ) : (
                                location
                            )}
                        </span>
                    </div>

                    {/* Mic Button */}
                    <button
                        onClick={() => {
                            // Trigger voice search - will be connected to HeroSection
                            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                            if (searchInput) {
                                searchInput.focus();
                                // Trigger mic click in HeroSection
                                const micButton = document.querySelector('[title="Search by voice"]') as HTMLButtonElement;
                                micButton?.click();
                            }
                        }}
                        className="w-9 h-9 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center transition-colors shadow-lg"
                        title="Voice search"
                        data-testid="mic-button"
                    >
                        <Mic size={18} className="text-secondary" />
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <User size={20} />
                        </Link>
                    ) : (
                        <Link
                            href="/auth"
                            className="text-white/90 hover:text-white text-sm font-medium uppercase tracking-wide transition-colors"
                        >
                            SIGN IN
                        </Link>
                    )}

                    {/* Install/Open App Button */}
                    {(isInstallable || !isInstalled) && (
                        <button
                            onClick={handleInstallClick}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 border border-white/30 flex items-center gap-2"
                        >
                            {isInstallable ? (
                                <>
                                    <span>📲</span>
                                    <span className="hidden sm:inline">Install App</span>
                                </>
                            ) : (
                                <span className="hidden sm:inline">Open App</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
