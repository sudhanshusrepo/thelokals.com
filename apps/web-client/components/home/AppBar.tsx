'use client';

import React, { useState, useEffect } from 'react';

interface AppBarProps {
    onSignIn?: () => void;
    onOpenApp?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ onSignIn, onOpenApp }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                    <button
                        onClick={onOpenApp}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 border border-white/30"
                    >
                        Open App
                    </button>
                </div>
            </div>
        </header>
    );
};
