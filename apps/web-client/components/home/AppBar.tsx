'use client';

import React, { useState, useEffect } from 'react';

interface AppBarProps {
    onSignIn?: () => void;
    onOpenApp?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const AppBar: React.FC<AppBarProps> = ({ onSignIn, onOpenApp }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed
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
        if (!deferredPrompt) {
            // Fallback for browsers that don't support install prompt
            if (onOpenApp) {
                onOpenApp();
            }
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return (
        <header
            className={`sticky top-0 z-50 h-[66px] gradient-primary transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">🏠</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">lokals</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onSignIn}
                        className="text-white/90 hover:text-white text-sm font-medium uppercase tracking-wide transition-colors"
                    >
                        SIGN IN
                    </button>

                    {/* Show Install button only if installable and not installed */}
                    {(isInstallable || !isInstalled) && (
                        <button
                            onClick={handleInstallClick}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 border border-white/30 flex items-center gap-2"
                        >
                            {isInstallable ? (
                                <>
                                    <span>📲</span>
                                    <span>Install App</span>
                                </>
                            ) : (
                                <span>Open App</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
