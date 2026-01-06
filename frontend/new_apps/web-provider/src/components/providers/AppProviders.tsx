
'use client';

import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../../contexts/AuthContext';
import { ReactNode } from 'react';

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
            }}
        >
            <AuthProvider>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: { zIndex: 99999 }
                    }}
                />
            </AuthProvider>
        </SWRConfig>
    );
};
