'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@thelocals/core/services/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { analytics } from '../lib/analytics';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Test Mode Override
        if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
            console.log('AuthContext: Test Mode Enabled - Setting mock user');
            setUser({
                id: 'test-user-id',
                aud: 'authenticated',
                role: 'authenticated',
                email: 'test@example.com',
                phone: '+1234567890',
                app_metadata: {},
                user_metadata: {},
                created_at: new Date().toISOString(),
            } as User);
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
            setUser(data.session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            setLoading(false);

            // Track authentication events
            if (event === 'SIGNED_IN' && newUser) {
                analytics.track('user_signin', {
                    method: 'phone',
                    userId: newUser.id,
                });
                analytics.identify(newUser.id, {
                    phone: newUser.phone,
                    email: newUser.email,
                });
            } else if (event === 'SIGNED_OUT') {
                analytics.track('user_signout');
                analytics.reset();
            } else if (event === 'USER_UPDATED' && newUser) {
                analytics.identify(newUser.id, {
                    phone: newUser.phone,
                    email: newUser.email,
                });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
