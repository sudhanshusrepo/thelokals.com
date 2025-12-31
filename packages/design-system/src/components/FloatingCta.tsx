import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';
import { CLIENT_V2_TOKENS } from '../tokens/client-v2';

export interface FloatingCtaProps {
    onPress: () => void;
    icon?: React.ReactNode; // Can pass SVG or Icon component
    variant?: 'action' | 'active';
    designVariant?: 'provider' | 'client';
    enableHaptic?: boolean; // For mobile haptic feedback
    style?: ViewStyle;
}

export const FloatingCta: React.FC<FloatingCtaProps> = ({
    onPress,
    icon,
    variant = 'action',
    designVariant = 'provider',
    enableHaptic = false,
    style
}) => {
    const tokens = designVariant === 'client' ? CLIENT_V2_TOKENS : PROVIDER_V2_TOKENS;

    // Handle color differences between token sets
    let bg: string;
    if (designVariant === 'client') {
        bg = variant === 'active' ? CLIENT_V2_TOKENS.colors.accentSuccess : CLIENT_V2_TOKENS.colors.accentDanger;
    } else {
        bg = variant === 'active' ? PROVIDER_V2_TOKENS.colors.successGreen : PROVIDER_V2_TOKENS.colors.accentDanger;
    }

    const handlePress = () => {
        // Haptic feedback for mobile (requires expo-haptics)
        // if (enableHaptic && Platform.OS !== 'web') {
        //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // }
        onPress();
    };

    // Get dimensions from tokens if available
    const size = designVariant === 'client' && CLIENT_V2_TOKENS.dimensions?.floatingCta?.size
        ? CLIENT_V2_TOKENS.dimensions.floatingCta.size
        : 56;

    // Get shadow for client variant
    const clientShadow = designVariant === 'client' && CLIENT_V2_TOKENS.shadows?.floating
        ? CLIENT_V2_TOKENS.shadows.floating
        : undefined;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: bg,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                clientShadow,
                style
            ]}
            onPress={handlePress}
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
