import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StatusBadge } from '@lokals/design-system';

export const ProviderStatusBadge = ({ status }: { status: 'approved' | 'pending' | 'rejected' }) => {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (status === 'approved') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [status]);

    return (
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <StatusBadge status={status} />
        </Animated.View>
    );
};
