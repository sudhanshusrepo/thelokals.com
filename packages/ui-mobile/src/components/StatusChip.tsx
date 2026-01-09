import React from 'react';
import { Text, View, ViewProps } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../ui.tokens';

type StatusChipProps = ViewProps & {
    label: string;
    tone?: 'success' | 'warning' | 'neutral';
};

export const StatusChip: React.FC<StatusChipProps> = ({
    label,
    tone = 'neutral',
    style,
    ...rest
}) => {
    const backgroundMap = {
        success: '#E6F7EE',
        warning: '#FFF4E0',
        neutral: '#F1F2F4',
    } as const;

    const colorMap = {
        success: colors.accentGreen,
        warning: colors.primary,
        neutral: colors.textSecondary,
    } as const;

    return (
        <View
            {...rest}
            style={[
                {
                    alignSelf: 'flex-start',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: radii.pill,
                    backgroundColor: backgroundMap[tone],
                },
                shadows.chip,
                style,
            ]}
        >
            <Text
                style={{
                    ...typography.caption,
                    color: colorMap[tone],
                }}
            >
                {label}
            </Text>
        </View>
    );
};
