import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors, radii, spacing, shadows } from '../ui.tokens';

type SurfaceProps = ViewProps & {
    elevated?: boolean;
    padding?: keyof typeof spacing;
};

export const Surface: React.FC<SurfaceProps> = ({
    style,
    elevated = false,
    padding = 'lg',
    children,
    ...rest
}) => (
    <View
        {...rest}
        style={[
            {
                backgroundColor: colors.backgroundSurface,
                borderRadius: radii.lg,
                padding: spacing[padding],
            },
            elevated ? shadows.card : null,
            style,
        ]}
    >
        {children}
    </View>
);
