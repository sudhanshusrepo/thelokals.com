'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // During SSR/Prerender, render children without the Provider.
        // This avoids executing AuthProvider's logic (hooks, side effects) during build,
        // preventing crashes like "TypeError: Cannot read properties of null (reading 'useContext')".
        // Children will consume the default value from AuthContext (which ends up being safe defaults).
        return <>{children}</>;
    }

    return (
        <AuthProvider>
            <RouteGuard>
                {children}
            </RouteGuard>
        </AuthProvider>
    );
}
