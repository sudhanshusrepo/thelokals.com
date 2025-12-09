import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@thelocals/core';

interface ProviderProfile {
  id: string;
  user_id: string;
  full_name: string;
  registration_status: 'unregistered' | 'pending' | 'verified' | 'rejected';
  digilocker_verified: boolean;
  profile_photo_verified: boolean;
  is_available: boolean;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProviderProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithPhone: (phone: string, recaptchaVerifier: any) => Promise<any>;
  verifyOtp: (confirmationResult: any, token: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => { },
  signInWithPhone: async () => { },
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
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching provider profile:', error);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching provider profile:', error);
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
        console.error('Auth initialization error:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    setData();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

  const signInWithPhone = async (phone: string, recaptchaVerifier: any) => {
    const { sendPhoneOTP } = await import('@thelocals/core/services/firebaseAuth');
    return sendPhoneOTP(phone, recaptchaVerifier);
  };

  const verifyOtp = async (confirmationResult: any, token: string) => {
    const { verifyPhoneOTP } = await import('@thelocals/core/services/firebaseAuth');
    const { authenticateWithPhone } = await import('@thelocals/core/services/authBridge');

    const firebaseToken = await verifyPhoneOTP(confirmationResult, token);
    const { session: newSession, user: newUser } = await authenticateWithPhone(
      firebaseToken,
      confirmationResult._phoneNumber || ''
    );

    setSession(newSession);
    setUser(newUser);

    // Fetch provider profile
    if (newUser) {
      await fetchProfile(newUser.id);
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
        console.error("Error signing out:", error);
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
