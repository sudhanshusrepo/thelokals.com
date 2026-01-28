'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, ShoppingCart, User } from 'lucide-react';

export const BottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Home',
            href: '/',
            icon: Home
        },
        {
            label: 'Bookings',
            href: '/bookings',
            icon: Calendar
        },
        {
            label: 'Cart',
            href: '/cart',
            icon: ShoppingCart
        },
        {
            label: 'Profile',
            href: '/profile',
            icon: User
        }
    ];

    // Hide bottom nav on specific paths if needed (e.g. login)
    if (pathname === '/login') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
