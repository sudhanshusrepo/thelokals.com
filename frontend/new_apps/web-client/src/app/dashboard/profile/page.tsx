'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Edit2, LogOut } from 'lucide-react';
import { designTokensV2 } from '../../../theme/design-tokens-v2';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProfilePage() {
    const { user: authUser, profile, signOut } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    // Fallback to auth user if profile not yet loaded
    const user = {
        name: profile?.full_name || authUser?.user_metadata?.full_name || 'User',
        phone: profile?.phone || authUser?.phone || '',
        email: authUser?.email || '',
        image: profile?.avatar_url || authUser?.user_metadata?.avatar_url || null
    };

    const addresses = [
        { id: '1', label: 'Home', address: '1204, Tower B, Supertech Emerald, Sector 65, Gurugram' },
        { id: '2', label: 'Office', address: 'WeWork Forum, Cyber City, Gurugram' }
    ];

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
            <h1 className="text-2xl font-bold text-v2-text-primary mb-6">My Profile</h1>

            {/* Profile Card */}
            <div className="bg-white rounded-v2-card shadow-v2-card p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-v2-gradient-start to-v2-gradient-end opacity-20" />

                <div className="relative flex items-center gap-6 mt-4">
                    <div className="w-20 h-20 rounded-full bg-white p-1 shadow-md">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <User size={40} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <div className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                            <span>{user.phone}</span>
                            <span>•</span>
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Edit2 size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Saved Addresses */}
            <h3 className="text-lg font-bold text-v2-text-primary mb-4">Saved Addresses</h3>
            <div className="grid gap-4 mb-8">
                {addresses.map(addr => (
                    <div key={addr.id} className="bg-white p-4 rounded-v2-card border border-gray-100 flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-full mt-1">
                            <MapPin size={18} className="text-gray-600" />
                        </div>
                        <div>
                            <div className="font-bold text-sm mb-0.5">{addr.label}</div>
                            <div className="text-sm text-gray-500">{addr.address}</div>
                        </div>
                        <button className="ml-auto text-xs font-medium text-v2-text-primary hover:underline">
                            Edit
                        </button>
                    </div>
                ))}
            </div>

            {/* Settings & Logout */}
            <div className="space-y-2">
                <button className="w-full text-left p-4 bg-white rounded-v2-card border border-gray-100 flex items-center justify-between hover:bg-gray-50">
                    <span className="font-medium text-gray-700">Notifications</span>
                    <div className="w-10 h-6 bg-v2-accent-success rounded-full relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                </button>

                <button
                    onClick={() => signOut()}
                    className="w-full text-left p-4 bg-white rounded-v2-card border border-gray-100 flex items-center justify-between text-red-500 hover:bg-red-50"
                >
                    <span className="font-medium flex items-center gap-2">
                        <LogOut size={18} />
                        Log Out
                    </span>
                </button>
            </div>
        </div>
    );
}
