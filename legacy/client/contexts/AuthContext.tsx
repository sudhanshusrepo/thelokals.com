
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@thelocals/core/services/supabase';
import { logger } from '@thelocals/core/services/logger';
import { Customer } from '@thelocals/core/types';
import { OTPConfirmation } from '@thelocals/core/services/otp';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  signOut: () => void;
  signInWithPhone: (phone: string) => Promise<OTPConfirmation>;
  verifyPhoneOTP: (confirmationResult: OTPConfirmation, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        logger.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCustomer = async () => {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id);

        if (data && data.length > 0) {
          setCustomer(data[0] as Customer);
        } else if (!error) {
          // No customer found, so create one
          const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert([{ id: user.id, email: user.email }])
            .select();

          if (newCustomer) {
            setCustomer(newCustomer[0] as Customer);
          }
          if (createError) {
            logger.error('Error creating customer', createError);
          }
        }
        if (error) logger.error('Error fetching customer', error);
      };
      fetchCustomer();
    } else {
      setCustomer(null);
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setCustomer(null);
  };

  const signInWithPhone = React.useCallback(async (phone: string) => {
    const { OTPService } = await import('@thelocals/core/services/otp');
    return OTPService.sendOTP(phone);
  }, []);

  const verifyPhoneOTP = React.useCallback(async (confirmationResult: OTPConfirmation, code: string) => {
    // Confirm the OTP (Supabase Native)
    const { session: newSession, user: newUser } = await confirmationResult.confirm(code);

    if (newSession) {
      setSession(newSession);
      setUser(newUser);
      // Fetch customer profile immediately
    } else {
      // If test mode returns no session but a user structure, we might need to handle it.
      // But for consistency:
      setSession(null); // Force re-login if no session
    }
  }, []);

  const value = React.useMemo(() => ({
    session,
    user,
    customer,
    loading,
    signOut,
    signInWithPhone,
    verifyPhoneOTP
  }), [session, user, customer, loading, signOut, signInWithPhone, verifyPhoneOTP]);

  return (
    <AuthContext.Provider value={value}>
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
