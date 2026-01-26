import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth, providerService } from '@thelocals/platform-core';

interface StatusToggleProps {
    className?: string;
}

export const StatusToggle = ({ className }: StatusToggleProps) => {
    const { user, profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // active checks
    const isActive = (profile as any)?.is_active || (profile as any)?.isActive || false;

    const toggleStatus = async () => {
        if (!user?.id || loading) return;

        setLoading(true);
        const newStatus = !isActive;
        const statusString = newStatus ? 'AVAILABLE' : 'OFFLINE';

        try {
            await providerService.updateAvailability(user.id, statusString);
            await refreshProfile();
            // Alert.alert is a bit intrusive, maybe just a console log or toast if available
            // In RN usually we use a Toast library, but Alert works for MVP
        } catch (error) {
            console.error('Failed to update status:', error);
            Alert.alert("Error", "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={toggleStatus}
            disabled={loading}
            className={`
                flex-row items-center gap-2 px-4 py-2 rounded-full transition-all border border-transparent
                ${isActive
                    ? 'bg-green-100 border-green-200'
                    : 'bg-gray-100 border-gray-200'
                }
                ${className}
            `}
        >
            {loading ? (
                <ActivityIndicator size="small" color={isActive ? '#15803d' : '#6b7280'} />
            ) : (
                <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-400'}`} />
            )}
            <Text className={`font-bold text-sm ${isActive ? 'text-green-800' : 'text-gray-600'}`}>
                {isActive ? 'ONLINE' : 'OFFLINE'}
            </Text>
        </TouchableOpacity>
    );
};
