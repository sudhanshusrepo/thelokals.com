'use client';

import React from 'react';
import { Search, MapPin, ChevronDown, User, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
    const { user } = useAuth();
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo & Location */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-text-primary">
                        lokals
                    </Link>

                    <button className="hidden md:flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-gray-50">
                        <span className="font-bold text-lokals-red truncate max-w-[150px]">
                            <MapPin size={16} className="inline mr-1" />
                            Select Location
                        </span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>
                </div>

                {/* Search Bar (Zepto Style) */}
                <div className="flex-1 max-w-2xl px-4 hidden md:block">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search for 'ac repair', 'cleaning'..."
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-lokals-green focus:ring-4 focus:ring-green-50 transition-all font-medium placeholder:text-gray-400"
                        />
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lokals-green transition-colors" />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">

                    {/* Mobile Search Trigger */}
                    <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <Search size={22} />
                    </button>

                    {user ? (
                        <Link href="/profile" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-8 h-8 flex items-center justify-center bg-lokals-yellow/20 rounded-full text-lokals-yellow font-bold">
                                {user.email?.[0].toUpperCase() || <User size={18} />}
                            </div>
                            <span className="hidden md:block font-medium text-sm text-gray-700">Profile</span>
                        </Link>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
                                <User size={18} />
                            </div>
                            <span className="hidden md:block font-medium text-sm text-gray-700">Login</span>
                        </Link>
                    )}

                    <button className="p-2 hover:bg-gray-50 rounded-lg relative transition-colors">
                        <ShoppingBag size={22} className="text-gray-700" />
                        {/* Badge example */}
                        {/* <span className="absolute top-1 right-1 w-2 h-2 bg-lokals-red rounded-full ring-1 ring-white"></span> */}
                    </button>
                </div>

            </div>

            {/* Mobile Location Sub-header */}
            <div className="md:hidden px-4 py-2 bg-white border-t border-gray-50 flex items-center justify-center">
                <button className="flex items-center gap-1 text-xs font-bold text-gray-700">
                    <MapPin size={12} className="text-lokals-red" />
                    Select Location <ChevronDown size={12} />
                </button>
            </div>
        </header>
    );
}
