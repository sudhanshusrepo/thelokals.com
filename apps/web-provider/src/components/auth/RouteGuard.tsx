'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // Public routes that don't need auth (e.g. landing page, login)
        // Add specific public routes here if any. Assuming root '/' is public or handles its own redirect.
        // If '/' is landing page for visitors, we shouldn't force redirect unless trying to access app.
        const isPublicRoute = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/api') || pathname.startsWith('/_next');

        // 1. Unauthenticated User
        if (!user && !isPublicRoute) {
            router.push('/'); // Or /auth/login
            return;
        }

        // 2. Authenticated User checks
        if (user) {
            // Case A: Profile Pending / Not Onboarded
            if (!profile?.registration_completed) {
                // Allow access to onboarding
                if (pathname.startsWith('/onboarding')) {
                    return;
                }
                // Redirect everything else to onboarding
                router.push('/onboarding');
            }
            // Case B: Onboarding Completed
            else {
                // If trying to access onboarding again, redirect to dashboard or status page
                if (pathname.startsWith('/onboarding')) {
                    if (profile.verification_status === 'pending') {
                        router.push('/verification-pending');
                    } else {
                        router.push('/dashboard');
                    }
                }
            }
        }
    }, [user, profile, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
};
