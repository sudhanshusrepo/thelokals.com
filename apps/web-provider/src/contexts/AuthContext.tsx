'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@thelocals/core';
import { logger } from '@thelocals/core/services/logger';
import { OTPConfirmation } from '@thelocals/core/services/otp';

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
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProviderProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<OTPConfirmation>;
  verifyOtp: (confirmationResult: OTPConfirmation, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => { },
  signInWithPhone: async () => { throw new Error('Not implemented'); },
  verifyOtp: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch provider profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', userId) // Changed from user_id to id
        .single();

      if (error) {
        logger.error('Error fetching provider profile:', error);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      logger.error('Error fetching provider profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    setData();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithPhone = async (phone: string) => {
    const { OTPService } = await import('@thelocals/core/services/otp');
    return OTPService.sendOTP(phone);
  };

  const verifyOtp = async (confirmationResult: OTPConfirmation, token: string) => {
    const { session, user } = await confirmationResult.confirm(token);

    setSession(session);
    setUser(user);

    // Fetch provider profile
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        setProfile(null);
      } catch (error) {
        logger.error("Error signing out:", error);
      }
    },
    signInWithPhone,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
