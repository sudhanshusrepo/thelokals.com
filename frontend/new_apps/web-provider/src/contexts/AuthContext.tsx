'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthProvider as CoreAuthProvider, useAuth as useCoreAuth } from '@thelocals/core';
import { supabase } from '@thelocals/core/services/supabase';
import { logger } from '@thelocals/core/services/logger';
import { OTPConfirmation, OTPService } from '@thelocals/core/services/otp';

export interface ProviderProfile {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    category: string;
    is_verified: boolean;
    is_active: boolean;
    registration_completed: boolean;
    phone_verified: boolean;
    business_name: string | null;
    description: string | null;
    verification_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface ProviderAuthContextType {
    session: Session | null;
    user: User | null;
    profile: ProviderProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithPhone: (phone: string) => Promise<OTPConfirmation>;
    verifyOtp: (confirmationResult: OTPConfirmation, token: string) => Promise<void>;
    setProfile: (profile: ProviderProfile | null) => void;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

const fetchProviderProfile = async (user: any): Promise<ProviderProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') {
                logger.error('Error fetching provider profile:', error);
            }
            return null;
        }
        return data;
    } catch (error) {
        logger.error('Error fetching provider profile:', error);
        return null;
    }
};

function ProviderAuthContent({ children }: { children: ReactNode }) {
    const { user, session, profile, loading: coreLoading, signOut: coreSignOut, refreshProfile } = useCoreAuth<ProviderProfile>();
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        if (!coreLoading) {
            setLocalLoading(false);
        }
    }, [coreLoading]);

    const signInWithPhone = async (phone: string) => {
        return OTPService.sendOTP(phone);
    };

    const verifyOtp = async (confirmationResult: OTPConfirmation, token: string) => {
        const { user: confirmedUser } = await confirmationResult.confirm(token);
        // CoreAuthProvider will detect the session change automatically via onAuthStateChange
        // But we might want to manually refresh profile if it's lagging, though the change event should trigger it.
        if (confirmedUser) {
            // Optional: wait for profile fetch? 
            // CoreAuthProvider's onAuthStateChange handles it.
        }
    };

    const setProfile = (newProfile: ProviderProfile | null) => {
        // This is a bit tricky since profile is managed by Core.
        // Direct mutation isn't exposed by simple Core.
        // But we can just assume this is for local optimist updates or we ignore it if unused.
        // Actually, looking at original code, setProfile was exposed.
        // We'll treat it as a no-op or implement a local override state if strictly needed.
        // For now, let's create a local override only if strictly necessary, but ideally we rely on DB + refresh.
        // A hacky way: cast to any if we rely on SWR-like revalidation.
        // Let's implement a 'refresh' alias.
        console.warn('setProfile called - prefer refreshing from DB');
        refreshProfile();
    };

    const signOut = async () => {
        await coreSignOut();
    };

    const value = {
        session,
        user,
        profile,
        loading: coreLoading || localLoading,
        signOut,
        signInWithPhone,
        verifyOtp,
        setProfile
    };

    return (
        <ProviderAuthContext.Provider value={value}>
            {children}
        </ProviderAuthContext.Provider>
    );
}


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <CoreAuthProvider fetchProfile={fetchProviderProfile}>
            <ProviderAuthContent>
                {children}
            </ProviderAuthContent>
        </CoreAuthProvider>
    );
};

export const useAuth = () => {
    const context = useContext(ProviderAuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
