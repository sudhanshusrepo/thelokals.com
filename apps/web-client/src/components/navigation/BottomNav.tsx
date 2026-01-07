'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Headphones, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function BottomNav() {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // 1. Don't render if loading or no user
    if (loading || !user) return null;

    // 2. Exclude paths (Full screen flows)
    const excludedPaths = [
        '/auth',
        '/checkout',
        '/payment',
        '/onboarding'
    ];

    // Check if current path starts with excluded path
    const isExcluded = excludedPaths.some(path => pathname?.startsWith(path));

    if (isExcluded) return null;

    const tabs = [
        {
            name: 'Home',
            href: '/',
            icon: Home
        },
        {
            name: 'Bookings',
            href: '/bookings',
            icon: Calendar
        },
        {
            name: 'Support',
            href: '/support',
            icon: Headphones
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User
        }
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-neutral-200 pb-safe pt-1 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-50"
            aria-label="Main navigation"
            role="navigation"
        >
            <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    // Active state: Exact match for root, startsWith for others
                    const isActive = tab.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors duration-200 ${isActive
                                ? 'text-primary'
                                : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                            />
                            <span className="text-[10px] font-medium tracking-tight">
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
