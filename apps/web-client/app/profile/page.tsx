'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, MapPin, LogOut, Settings, ChevronRight } from 'lucide-react';
import { AppBar } from '../../components/home/AppBar'; // Legacy
import { AppBar as AppBarV2 } from '@/components/v2'; // V2
import { useV2Design } from '@/lib/feature-flags';
import { designTokensV2 } from '@/theme/design-tokens-v2';

export default function ProfilePage() {
    const showV2 = useV2Design();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // Let Layout/BottomNav handle redirects if needed
            return;
        }

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        };

        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (showV2) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F0F0F0', paddingBottom: '100px' }}>
                <AppBarV2 title="Profile" />

                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    paddingTop: '80px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    {/* V2 Profile Header */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: designTokensV2.radius.hero,
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: designTokensV2.shadows.card,
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: designTokensV2.colors.gradient.css,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            color: 'white'
                        }}>
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0E121A', margin: 0 }}>
                                {profile?.full_name || 'Lokals User'}
                            </h2>
                            <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 8px 0' }}>
                                {profile?.phone || user?.email}
                            </p>
                            <span style={{
                                backgroundColor: '#E0F7FA',
                                color: '#006064',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                Verified Customer
                            </span>
                        </div>
                    </div>

                    {/* Menu Options */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: designTokensV2.radius.card,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        {[
                            { icon: <MapPin size={20} />, label: 'Saved Addresses', sub: 'Manage your locations' },
                            { icon: <Settings size={20} />, label: 'Settings', sub: 'Preferences & Notifications' },
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: 'none',
                                    background: 'transparent',
                                    borderBottom: idx === 0 ? '1px solid #F0F0F0' : 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: '#F7C84620',
                                        color: '#F7C846',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0E121A' }}>{item.label}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{item.sub}</div>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="#ccc" />
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: '#FFEBEE',
                            color: '#D32F2F',
                            border: 'none',
                            borderRadius: designTokensV2.radius.btn,
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>

                </div>
            </div>
        );
    }

    // Legacy Fallback
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <AppBar />

            <div className="pt-20 px-4 max-w-md mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{profile?.full_name || 'User'}</h2>
                        <p className="text-slate-500 text-sm">{profile?.phone || user?.email}</p>
                    </div>
                </div>

                {/* Menu Options */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                    {/* Saved Addresses */}
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Saved Addresses</h3>
                                <p className="text-xs text-slate-400">Manage your locations</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400" />
                    </div>

                    {/* Settings */}
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Settings</h3>
                                <p className="text-xs text-slate-400">Preferences & Notifications</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400" />
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-between group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                <LogOut size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-600">Log Out</h3>
                                <p className="text-xs text-red-300">Sign out of your account</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
