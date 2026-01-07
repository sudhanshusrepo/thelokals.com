'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Topbar = () => {
    const { profile } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-neutral-200 fixed top-0 right-0 left-0 md:left-64 z-20 px-4 md:px-6 flex items-center justify-between">
            {/* Mobile Menu Trigger (Stub) */}
            <button className="md:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
                <Menu size={24} />
            </button>

            {/* Search - Hidden on mobile for now */}
            <div className="hidden md:flex flex-1 max-w-lg">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-neutral-900 line-clamp-1">{profile?.full_name || 'Provider'}</p>
                        <div className="flex items-center justify-end gap-1">
                            <div className={`w-2 h-2 rounded-full ${profile?.is_active ? 'bg-success' : 'bg-neutral-300'}`}></div>
                            <p className="text-xs text-neutral-500">{profile?.is_active ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                    <div className="w-9 h-9 bg-primary-100 text-primary rounded-full flex items-center justify-center font-bold border border-primary-200">
                        {profile?.full_name?.charAt(0) || 'P'}
                    </div>
                </div>
            </div>
        </header>
    );
};
