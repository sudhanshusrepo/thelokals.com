import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './layout/AdminLayout';

interface AdminShellLayoutProps {
    children: React.ReactNode;
}

export const AdminShellLayout = ({ children }: AdminShellLayoutProps) => {
    const { adminUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !adminUser) {
            router.push('/login');
        }
    }, [loading, adminUser, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-gray-500 font-medium">Loading admin portal...</p>
                </div>
            </div>
        );
    }

    if (!adminUser) {
        return null; // Will redirect via useEffect
    }

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
};
