
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@thelocals/core/services/supabase';
import { Customer } from '@thelocals/core/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  signOut: () => void;
  signInWithPhone: (phone: string, recaptchaVerifier: any) => Promise<any>;
  verifyPhoneOTP: (confirmationResult: any, code: string) => Promise<void>;
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
        console.error("Error getting session:", error);
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
            console.error('Error creating customer', createError);
          }
        }
        if (error) console.error('Error fetching customer', error);
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

  const signInWithPhone = async (phone: string, recaptchaVerifier: any) => {
    const { sendPhoneOTP } = await import('@thelocals/core/services/firebaseAuth');
    return sendPhoneOTP(phone, recaptchaVerifier);
  };

  const verifyPhoneOTP = async (confirmationResult: any, code: string) => {
    const { verifyPhoneOTP: verifyOTP } = await import('@thelocals/core/services/firebaseAuth');
    const { authenticateWithPhone } = await import('@thelocals/core/services/authBridge');

    const firebaseToken = await verifyOTP(confirmationResult, code);
    const { session: newSession, user: newUser } = await authenticateWithPhone(
      firebaseToken,
      confirmationResult._phoneNumber || ''
    );

    setSession(newSession);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ session, user, customer, loading, signOut, signInWithPhone, verifyPhoneOTP }}>
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
