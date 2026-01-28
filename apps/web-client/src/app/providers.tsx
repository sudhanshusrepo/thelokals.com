'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleMapProvider, AuthProvider } from '@thelocals/platform-core';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <GoogleMapProvider>
                    {children}
                </GoogleMapProvider>
            </QueryClientProvider>
        </AuthProvider>
    );
}
