'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, MapPin, LogOut, Settings, ChevronRight } from 'lucide-react';
import { AppBar } from '../../components/home/AppBar';

export default function ProfilePage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // Let Layout/BottomNav handle redirects if needed, but safe to redirect logic here too
            // router.push('/auth'); 
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
