'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { adminService } from '@thelocals/core/services/adminService';
import { AdminUser } from '@thelocals/core/types';

interface AuthContextType {
    adminUser: AdminUser | null;
    loading: boolean;
    signInWithGoogle: () => void;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
            if (session?.user) {
                await loadAdminUser(session.user.email!);
            } else {
                setAdminUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkSession = async () => {
        try {
            // Add timeout to prevent infinite loading
            const sessionPromise = supabase.auth.getSession();
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Session check timeout')), 3000)
            );

            const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
            if (session?.user) {
                await loadAdminUser(session.user.email!);
            }
        } catch (error) {
            console.error('Session check failed:', error);
            // Don't block the UI - just set loading to false
        } finally {
            setLoading(false);
        }
    };

    const loadAdminUser = async (email: string) => {
        try {
            const admin = await adminService.getAdminByEmail(email);
            if (admin) {
                setAdminUser(admin);
            } else {
                // User is authenticated but not an admin
                await supabase.auth.signOut();
                throw new Error('Unauthorized: Not an admin user');
            }
        } catch (error) {
            console.error('Failed to load admin user:', error);
            setAdminUser(null);
        }
    };

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

        if (data.user) {
            await loadAdminUser(data.user.email!);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setAdminUser(null);
    };

    return (
        <AuthContext.Provider value={{ adminUser, loading, signInWithGoogle, signInWithEmail, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
