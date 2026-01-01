import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

type ChipVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface ChipProps {
    label: string;
    variant?: ChipVariant;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const variantStyles: Record<ChipVariant, { backgroundColor: string; textColor: string }> = {
    success: {
        backgroundColor: colors.statusSuccess,
        textColor: colors.textOnPrimary,
    },
    warning: {
        backgroundColor: colors.accentAmber,
        textColor: colors.textOnPrimary,
    },
    error: {
        backgroundColor: colors.accentRed,
        textColor: colors.textOnDark,
    },
    info: {
        backgroundColor: colors.statusInfo,
        textColor: colors.textOnDark,
    },
    default: {
        backgroundColor: colors.bgCard,
        textColor: colors.textPrimary,
    },
};

export const Chip: React.FC<ChipProps> = ({
    label,
    variant = 'default',
    style,
    textStyle,
}) => {
    const variantStyle = variantStyles[variant];

    return (
        <View
            style={[
                styles.chip,
                { backgroundColor: variantStyle.backgroundColor },
                style,
            ]}
        >
            <Text
                style={[
                    styles.chipText,
                    { color: variantStyle.textColor },
                    textStyle,
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    chipText: {
        ...typography.labelSmall,
        fontWeight: '600',
    },
});
