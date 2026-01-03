'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const { adminUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !adminUser) {
            router.push('/login');
        }
    }, [adminUser, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!adminUser) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Sidebar />
            <Topbar />

            <main className="md:ml-64 pt-16 min-h-screen">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
