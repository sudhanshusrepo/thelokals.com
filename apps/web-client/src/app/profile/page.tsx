'use client';

import React from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Settings, CreditCard, Shield, MapPin, ChevronRight, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Surface, Section } from '../../components/ui/Surface';

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50 pb-24 px-4 pt-4">
                <header className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                </header>

                {/* User Info */}
                <Surface elevated className="flex items-center gap-4 mb-6 animate-fadeIn">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-lokals-orange rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user?.user_metadata?.name || 'User'}</h2>
                        <p className="text-gray-500 font-medium">{user?.phone || user?.email}</p>
                    </div>
                </Surface>

                {/* Menu */}
                <Section>
                    <Surface elevated className="space-y-1 !p-2">
                        {[
                            { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600' },
                            { icon: MapPin, label: 'Addresses', color: 'bg-blue-50 text-blue-600' },
                            { icon: CreditCard, label: 'Payments', color: 'bg-green-50 text-green-600' },
                            { icon: Shield, label: 'Privacy', color: 'bg-purple-50 text-purple-600' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center`}>
                                        <item.icon size={20} />
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-gray-500" size={20} />
                            </div>
                        ))}
                    </Surface>
                </Section>

                <Section>
                    <button
                        onClick={handleSignOut}
                        className="w-full bg-white border-2 border-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </Section>
            </div>
        </AuthGuard>
    );
}
