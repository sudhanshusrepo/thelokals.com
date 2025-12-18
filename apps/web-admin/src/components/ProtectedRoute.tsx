import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { AdminRole } from '@thelocals/core/types';

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: AdminRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { adminUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !adminUser) {
            router.replace('/login');
        }
    }, [loading, adminUser, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!adminUser) {
        return null; // Will redirect via useEffect
    }

    // Check role-based access
    if (roles && !roles.includes(adminUser.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
