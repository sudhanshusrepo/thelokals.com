'use client';

import React from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Settings, CreditCard, Shield, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-50 pb-24">
                <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-30">
                    <h1 className="text-xl font-bold text-neutral-900">My Profile</h1>
                </header>

                <main className="p-4 space-y-6">
                    {/* User Info */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-xl font-bold text-neutral-500">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">{user?.user_metadata?.name || 'User'}</h2>
                            <p className="text-neutral-500">{user?.phone || user?.email}</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                        <div className="p-4 flex items-center gap-3 border-b border-neutral-50 cursor-pointer hover:bg-neutral-50">
                            <span className="text-neutral-700 font-medium">Settings</span>
                        </div>
                        <div className="p-4 flex items-center gap-3 border-b border-neutral-50 cursor-pointer hover:bg-neutral-50">
                            <MapPin size={20} className="text-neutral-400" />
                            <span className="text-neutral-700 font-medium">Addresses</span>
                        </div>
                        <div className="p-4 flex items-center gap-3 border-b border-neutral-50 cursor-pointer hover:bg-neutral-50">
                            <CreditCard size={20} className="text-neutral-400" />
                            <span className="text-neutral-700 font-medium">Payment Methods</span>
                        </div>
                        <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50">
                            <Shield size={20} className="text-neutral-400" />
                            <span className="text-neutral-700 font-medium">Privacy & Security</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </main>
            </div>
        </AuthGuard>
    );
}
