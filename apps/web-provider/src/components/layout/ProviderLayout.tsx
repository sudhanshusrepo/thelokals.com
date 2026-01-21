'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarItem } from './SidebarItem';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { PageTransition } from './PageTransition';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ProviderLayoutProps {
    children: ReactNode;
}

export const ProviderLayout = ({ children }: ProviderLayoutProps) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-brand-green" size={32} />
                    <p className="text-sm text-neutral-500 font-medium">Loading Portal...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-brand-bg">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Main Content */}
            <main className="flex-1 min-w-0 bg-brand-bg transition-all duration-300 md:ml-64 relative z-0 pb-20 md:pb-6">
                <div className="max-w-7xl mx-auto p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
};
