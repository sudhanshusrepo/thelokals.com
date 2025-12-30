import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';

export interface StatusBadgeProps {
    status: 'pending' | 'approved' | 'active';
    style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
    const config = getStatusConfig(status);

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
            {status === 'approved' && <View style={[styles.dot, { backgroundColor: config.color }]} />}
            <Text style={[styles.text, { color: config.color }]}>
                {status.toUpperCase()}
            </Text>
        </View>
    );
};

const getStatusConfig = (status: StatusBadgeProps['status']) => {
    switch (status) {
        case 'approved':
            return { bg: 'rgba(138, 233, 141, 0.2)', color: PROVIDER_V2_TOKENS.colors.successGreen };
        case 'active':
            return { bg: 'rgba(138, 233, 141, 0.2)', color: PROVIDER_V2_TOKENS.colors.successGreen }; // Same for now
        case 'pending':
        default:
            return { bg: 'rgba(247, 200, 70, 0.2)', color: '#D4A000' }; // Darker yellow/gold
    }
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: PROVIDER_V2_TOKENS.radius.pill,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});
