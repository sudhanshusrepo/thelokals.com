'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthProvider as CoreAuthProvider, useAuth as useCoreAuth, supabase, adminService, AdminUser } from "@thelocals/platform-core";
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
    adminUser: AdminUser | null;
    user: any;
    loading: boolean;
    signInWithGoogle: () => void;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const fetchAdminProfile = async (user: any): Promise<AdminUser | null> => {
    if (!user?.id) return null;
    try {
        // Use ID-based lookup which is more robust and bypasses indirect email queries
        const admin = await adminService.getAdminById(user.id);
        return admin || null;
    } catch (error) {
        console.error('Failed to load admin user:', error);
        return null;
    }
};

function AdminAuthContent({ children }: { children: ReactNode }) {
    const { user, profile, loading: coreLoading, signOut: coreSignOut } = useCoreAuth<AdminUser>();
    const router = useRouter();
    const [localLoading, setLocalLoading] = useState(true);

    // Effect to handle redirect logic or additional state if needed
    useEffect(() => {
        if (!coreLoading) {
            setLocalLoading(false);
            // If user is logged in but no admin profile, redirect to unauthorized instead of signing out
            if (user && !profile) {
                console.warn('User authenticated but not an admin. Redirecting to unauthorized.');
                router.push('/unauthorized');
            }
        }
    }, [coreLoading, user, profile, router]);


    const signInWithGoogle = () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        // Profile will be auto-refetched by CoreAuthProvider due to auth state change
    };

    const signOut = async () => {
        await coreSignOut();
        router.push('/login');
    };

    const value = {
        adminUser: profile,
        user,
        loading: coreLoading || localLoading,
        signInWithGoogle,
        signInWithEmail,
        signOut
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <CoreAuthProvider fetchProfile={fetchAdminProfile}>
            <AdminAuthContent>
                {children}
            </AdminAuthContent>
        </CoreAuthProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
