'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { AuthProvider as CoreAuthProvider, useAuth as useCoreAuth, supabase, logger, OTPConfirmation, OTPService, WorkerProfile, providerService } from "@thelocals/platform-core";

interface ProviderAuthContextType {
    session: Session | null;
    user: User | null;
    profile: WorkerProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithPhone: (phone: string) => Promise<OTPConfirmation>;
    verifyOtp: (confirmationResult: OTPConfirmation, token: string) => Promise<void>;
    setProfile: (profile: WorkerProfile | null) => void;
    refreshProfile: () => Promise<void>;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

const fetchProviderProfile = async (user: User): Promise<WorkerProfile | null> => {
    try {
        if (!user?.id) return null;
        return await providerService.getProfile(user.id);
    } catch (error) {
        logger.error('Error fetching provider profile:', error);
        return null;
    }
};

function ProviderAuthContent({ children }: { children: ReactNode }) {
    const { user, session, profile, loading: coreLoading, signOut: coreSignOut, refreshProfile } = useCoreAuth<WorkerProfile>();
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        if (!coreLoading) {
            setLocalLoading(false);
        }
    }, [coreLoading]);

    const signInWithPhone = async (phone: string) => {
        return OTPService.sendOTP(phone);
    };

    const router = useRouter();
    const supabaseClient = createClient();

    const verifyOtp = async (confirmationResult: OTPConfirmation, token: string) => {
        const { user: confirmedUser, session } = await confirmationResult.confirm(token);

        if (!session) {
            throw new Error('Verification failed: No session created');
        }

        await supabaseClient.auth.setSession(session);
        // Let the client handle navigation

        if (confirmedUser) {
            // Profile refresh is handled by Core
        }
    };

    const setProfile = (newProfile: WorkerProfile | null) => {
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
        setProfile,
        refreshProfile
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
