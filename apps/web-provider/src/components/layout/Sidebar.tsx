'use client';

import {
    LayoutDashboard,
    Briefcase,
    Wallet,
    User,
    LogOut
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
    const { signOut } = useAuth();

    return (
        <aside className="w-64 bg-white border-r border-neutral-200 h-screen fixed left-0 top-0 hidden md:flex flex-col z-30">
            <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
                    <span className="text-xl font-bold text-primary">lokals</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1 ml-10">Provider Portal</p>
            </div>

            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                    <SidebarItem href="/" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem href="/jobs" icon={Briefcase} label="Jobs" />
                    <SidebarItem href="/earnings" icon={Wallet} label="Earnings" />
                </div>

                <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-4">Account</p>
                    <div className="space-y-1">
                        <SidebarItem href="/profile" icon={User} label="Profile" />
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-neutral-100">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};
