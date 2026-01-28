
'use client';

import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../../contexts/AuthContext';
import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleMapProvider } from '@thelocals/platform-core';

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
            }}
        >
            <QueryClientProvider client={queryClient}>
                <GoogleMapProvider>
                    <AuthProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                style: { zIndex: 99999 }
                            }}
                        />
                    </AuthProvider>
                </GoogleMapProvider>
            </QueryClientProvider>
        </SWRConfig>
    );
};
