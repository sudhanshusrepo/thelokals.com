import React from 'react';
import { View, ViewProps } from 'react-native';
import { spacing } from '../ui.tokens';

export const Section: React.FC<ViewProps> = ({ style, children, ...rest }) => (
    <View
        {...rest}
        style={[{ marginBottom: spacing.xxl }, style]}
    >
        {children}
    </View>
);
