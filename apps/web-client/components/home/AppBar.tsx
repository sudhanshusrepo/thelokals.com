'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            className={`sticky top-0 z-50 h-[66px] gradient-primary transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.svg"
                        alt="lokals logo"
                        width={40}
                        height={40}
                        priority
                        className="rounded-lg"
                    />
                    <span className="text-white font-bold text-lg tracking-tight">lokals</span>
                </Link>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                            <User size={20} />
                        </Link>
                    ) : (
                        <button
                            onClick={onSignIn}
                            className="text-white/90 hover:text-white text-sm font-medium uppercase tracking-wide transition-colors"
                        >
                            SIGN IN
                        </button>
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
