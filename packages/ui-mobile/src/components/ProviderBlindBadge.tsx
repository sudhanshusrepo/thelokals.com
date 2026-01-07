import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { CLIENT_V2_TOKENS } from '../tokens/client-v2';

export interface ProviderBlindBadgeProps {
    message?: string;
    style?: ViewStyle;
}

/**
 * ProviderBlindBadge Component
 * Trust badge showing "Best provider assigned instantly"
 * Features micro-animation on mount
 */
export const ProviderBlindBadge: React.FC<ProviderBlindBadgeProps> = ({
    message = 'Best provider assigned instantly',
    style
}) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Micro-animation on mount
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.badge,
                style,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>✓</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CLIENT_V2_TOKENS.colors.accentSuccess,
        paddingVertical: CLIENT_V2_TOKENS.spacing.xs,
        paddingHorizontal: CLIENT_V2_TOKENS.spacing.md,
        borderRadius: CLIENT_V2_TOKENS.radius.pill,
        gap: CLIENT_V2_TOKENS.spacing.xs,
        alignSelf: 'flex-start',
        ...CLIENT_V2_TOKENS.shadows.elevated,
    },
    iconContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 12,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    message: {
        fontSize: CLIENT_V2_TOKENS.typography.label.fontSize,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
});
