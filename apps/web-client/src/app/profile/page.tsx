'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@thelocals/platform-core';
import { LogOut, Settings, MapPin, CreditCard, Shield, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    // Handle redirect on client-side only to avoid SSR issues
    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

            {/* User Info */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lokals-yellow to-lokals-green flex items-center justify-center text-white text-2xl font-bold">
                    {user.phone ? user.phone[3] : 'U'}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User</h2>
                    <p className="text-gray-500">{user.phone}</p>
                </div>
            </div>

            {/* Menu */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                {[
                    { icon: Settings, label: 'Settings', color: 'text-gray-600' },
                    { icon: MapPin, label: 'Saved Addresses', color: 'text-blue-600' },
                    { icon: CreditCard, label: 'Payment Methods', color: 'text-green-600' },
                    { icon: Shield, label: 'Privacy & Safety', color: 'text-purple-600' },
                ].map((item, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left">
                        <div className="flex items-center gap-4">
                            <item.icon className={item.color} size={20} />
                            <span className="font-medium text-gray-700">{item.label}</span>
                        </div>
                        <ChevronRight className="text-gray-300" size={18} />
                    </button>
                ))}
            </div>

            <button
                onClick={signOut}
                className="w-full bg-white border border-red-100 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50"
            >
                <LogOut size={20} />
                Sign Out
            </button>
        </div>
    );
}
