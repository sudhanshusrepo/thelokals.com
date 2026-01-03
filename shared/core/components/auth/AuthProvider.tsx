'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import { logger } from '../../services/logger';

export interface AuthContextType<TProfile = any> {
    session: Session | null;
    user: User | null;
    profile: TProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType<any> | undefined>(undefined);

interface AuthProviderProps<TProfile> {
    children: ReactNode;
    fetchProfile?: (user: User) => Promise<TProfile | null>;
    onEvent?: (event: AuthChangeEvent, session: Session | null) => void;
    onSignOut?: () => void;
}

export function AuthProvider<TProfile = any>({
    children,
    fetchProfile,
    onEvent,
    onSignOut
}: AuthProviderProps<TProfile>) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<TProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async (currentUser: User) => {
        if (!fetchProfile) return;
        try {
            const data = await fetchProfile(currentUser);
            setProfile(data);
        } catch (error) {
            logger.error('Error fetching auth profile:', error);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await loadProfile(user);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await loadProfile(session.user);
                    }
                }
            } catch (error) {
                logger.error('Auth initialization error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: listener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
            if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    await loadProfile(currentSession.user);
                } else {
                    setProfile(null);
                }

                setLoading(false);

                if (onEvent) {
                    onEvent(event, currentSession);
                }
            }
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setProfile(null);
            if (onSignOut) onSignOut();
        } catch (error) {
            logger.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = <TProfile = any>() => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context as AuthContextType<TProfile>;
};
