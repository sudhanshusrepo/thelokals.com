import { describe, it, expect, vi } from 'vitest';
import { supabase } from './supabase';

// Mock Supabase client to avoid real network calls during unit tests
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getSession: vi.fn(),
            signInWithPassword: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(),
        })),
    })),
}));

describe('Supabase Service', () => {
    it('should initialize supabase client', () => {
        expect(supabase).toBeDefined();
        expect(supabase.auth).toBeDefined();
    });

    it('should expose auth methods', () => {
        expect(typeof supabase.auth.getSession).toBe('function');
        expect(typeof supabase.auth.signInWithPassword).toBe('function');
    });
});
