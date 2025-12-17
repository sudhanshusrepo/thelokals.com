import { supabase } from './supabase';
import { CONFIG } from '../config';
import { Session, User } from '@supabase/supabase-js';

/**
 * Bridge Firebase authentication to Supabase session
 * @param firebaseToken - Firebase ID token from successful OTP verification
 * @param phone - Phone number in E.164 format
 */
export const createSupabaseSession = async (
    firebaseToken: string,
    phone: string
): Promise<{ session: Session; user: User }> => {
    try {
        // Test Mode Bypass
        if (firebaseToken === 'MOCK_FIREBASE_TOKEN_123456') {
            console.log('[TEST MODE] Bypassing auth bridge with mock session');
            return {
                session: {
                    access_token: 'mock-access-token',
                    refresh_token: 'mock-refresh-token',
                    expires_in: 3600,
                    token_type: 'bearer',
                    user: {
                        id: 'mock-user-id',
                        aud: 'authenticated',
                        role: 'authenticated',
                        email: 'test@example.com',
                        phone: phone,
                        app_metadata: {},
                        user_metadata: {},
                        created_at: new Date().toISOString(),
                    }
                } as unknown as Session,
                user: {
                    id: 'mock-user-id',
                    aud: 'authenticated',
                    role: 'authenticated',
                    email: 'test@example.com',
                    phone: phone,
                    app_metadata: {},
                    user_metadata: {},
                    created_at: new Date().toISOString(),
                } as User
            };
        }

        const supabaseUrl = CONFIG.SUPABASE_URL;

        if (!supabaseUrl) {
            throw new Error('Supabase URL not configured');
        }

        // Call Supabase Edge Function to verify Firebase token and create session
        const response = await fetch(`${supabaseUrl}/functions/v1/auth-firebase-phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CONFIG.SUPABASE_ANON_KEY || '',
            },
            body: JSON.stringify({
                firebaseToken,
                phone,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create session');
        }

        const { session, user } = await response.json();

        // Set the session in Supabase client
        const { error: setSessionError } = await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
        });

        if (setSessionError) {
            throw setSessionError;
        }

        return { session, user };
    } catch (error: any) {
        console.error('Error creating Supabase session:', error);
        throw new Error(error.message || 'Failed to authenticate');
    }
};

/**
 * Complete phone authentication flow
 * Combines Firebase OTP verification with Supabase session creation
 * @param firebaseToken - Firebase ID token
 * @param phone - Phone number
 */
export const authenticateWithPhone = async (
    firebaseToken: string,
    phone: string
): Promise<{ session: Session; user: User }> => {
    return createSupabaseSession(firebaseToken, phone);
};
