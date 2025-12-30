import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';

export interface FloatingCtaProps {
    onPress: () => void;
    icon?: React.ReactNode; // Can pass SVG or Icon component
    variant?: 'action' | 'active';
    style?: ViewStyle;
}

export const FloatingCta: React.FC<FloatingCtaProps> = ({
    onPress,
    icon,
    variant = 'action',
    style
}) => {
    const bg = variant === 'active'
        ? PROVIDER_V2_TOKENS.colors.successGreen
        : PROVIDER_V2_TOKENS.colors.accentDanger;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: bg }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* If no icon provided, show placeholder plus */}
            {icon || <Text style={styles.plus}>+</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        bottom: 24,
        right: 24,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    plus: {
        color: '#FFF',
        fontSize: 24,
        marginTop: -2, // Optical adjustment
    },
});
