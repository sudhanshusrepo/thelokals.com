'use client';

import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, User, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { Button, Input } from '@thelocals/ui-web';
import { useUserLocation, LocationPermissionModal, LocationSelector, useAuth } from '@thelocals/platform-core';

export function Header() {
    const { user } = useAuth();
    const { location, permissionGranted } = useUserLocation();
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

    // If location is not present, default to Permission Modal on click
    // If present, open Location Selector Map Modal
    const handleLocationClick = () => {
        if (!location && !permissionGranted) {
            setIsPermissionModalOpen(true);
        } else {
            setIsLocationModalOpen(true);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

                    {/* Logo & Location */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-bold tracking-tight text-text-primary">
                            lokals
                        </Link>

                        <button
                            onClick={handleLocationClick}
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-gray-50"
                        >
                            <span className="font-bold text-lokals-red truncate max-w-[200px] flex items-center">
                                <MapPin size={16} className="inline mr-1" />
                                {location?.address ? location.address.split(',')[0] : 'Select Location'}
                            </span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Search Bar (Zepto Style) */}
                    <div className="flex-1 max-w-2xl px-4 hidden md:block">
                        <div className="relative group">
                            <Input
                                type="text"
                                placeholder="Search for 'ac repair', 'cleaning'..."
                                className="bg-gray-100 border-transparent rounded-xl text-sm pl-11 focus:bg-white focus:border-lokals-green focus:ring-4 focus:ring-green-50"
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
                                    {user?.email && user.email[0] ? user.email[0].toUpperCase() : <User size={18} />}
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

                        <Link href="/cart" className="p-2 hover:bg-gray-50 rounded-lg relative transition-colors block">
                            <ShoppingBag size={22} className="text-gray-700" />

                        </Link>
                    </div>

                </div>

                {/* Mobile Location Sub-header */}
                <div className="md:hidden px-4 py-2 bg-white border-t border-gray-50 flex items-center justify-center">
                    <button onClick={handleLocationClick} className="flex items-center gap-1 text-xs font-bold text-gray-700">
                        <MapPin size={12} className="text-lokals-red" />
                        {location?.pincode ? `Serving ${location.pincode}` : 'Select Location'} <ChevronDown size={12} />
                    </button>
                </div>
            </header>

            <LocationPermissionModal
                open={isPermissionModalOpen}
                onGrant={() => {
                    setIsPermissionModalOpen(false);
                    window.location.reload(); // Simple reload to trigger flow
                }}
            />

            {/* Manual Location Selection Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
                        <button
                            onClick={() => setIsLocationModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Change Location</h2>
                        <LocationSelector
                            location={location}
                            onChange={(newLoc) => {
                                setIsLocationModalOpen(false);
                                window.location.reload();
                            }}
                            showMap={true}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
