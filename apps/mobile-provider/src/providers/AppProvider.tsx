import React, { useEffect, useState } from 'react';
import { AuthProvider } from '@thelocals/platform-core';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Ensure supabase is ready (it's sync but good practice if we add async init later)
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
};
