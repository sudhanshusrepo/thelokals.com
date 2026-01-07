'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, Settings, LogOut, Wallet, HelpCircle } from 'lucide-react';
import { designTokensV2 } from '../../theme/design-tokens-v2';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', icon: Home, href: '/' }, // Back to main home
        { label: 'Bookings', icon: Calendar, href: '/dashboard/bookings' },
        { label: 'Wallet', icon: Wallet, href: '/dashboard/wallet' },
        { label: 'Help', icon: HelpCircle, href: '/dashboard/help' },
        { label: 'Profile', icon: User, href: '/dashboard/profile' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 p-6">
                <div className="text-2xl font-bold text-v2-text-primary mb-10 pl-2">
                    LOKALS
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname.startsWith(item.href) && item.href !== '/';
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-v2-btn font-medium transition-all ${isActive
                                    ? 'bg-v2-text-primary text-white shadow-md'
                                    : 'text-v2-text-secondary hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-gray-100">
                    <button className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-v2-btn w-full transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-v2-floating">
                {navItems.map(item => {
                    const isActive = pathname.startsWith(item.href) && item.href !== '/';
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? 'text-v2-text-primary' : 'text-gray-400'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
