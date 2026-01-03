'use client';

import { AuthProvider as CoreAuthProvider, useAuth as useCoreAuth, AuthContextType } from '@thelocals/core';

// Re-export specific hook for web-client
export const useAuth = () => useCoreAuth<any>();

// Wrapper to provide app-specific behavior if needed (e.g. analytics in future)
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <CoreAuthProvider>
            {children}
        </CoreAuthProvider>
    );
}
