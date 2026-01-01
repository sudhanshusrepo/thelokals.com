import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';

export interface EarningsCardProps {
    status: 'Pending' | 'Completed' | 'Next Payout';
    amount: string;
    period: string;
    style?: ViewStyle;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
    status,
    amount,
    period,
    style
}) => {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.header}>
                <Text style={styles.status}>{status}</Text>
            </View>

            <Text style={styles.amount}>{amount}</Text>
            <Text style={styles.period}>{period}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        minWidth: 160,
        height: 120, // Adjusted based on prompt context vs content fit
        backgroundColor: PROVIDER_V2_TOKENS.colors.bgPrimary, // Or White? Prompt implies color coded.
        borderRadius: PROVIDER_V2_TOKENS.radius.card,
        padding: PROVIDER_V2_TOKENS.spacing.md,
        justifyContent: 'space-between',
        // Border or subtle shadow
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    status: {
        fontSize: PROVIDER_V2_TOKENS.typography.caption.fontSize,
        fontWeight: '600',
        color: PROVIDER_V2_TOKENS.typography.label.color,
        textTransform: 'uppercase',
    },
    amount: {
        fontSize: 28, // Custom large for earnings
        fontWeight: '700',
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
        marginVertical: PROVIDER_V2_TOKENS.spacing.xs,
    },
    period: {
        fontSize: PROVIDER_V2_TOKENS.typography.caption.fontSize,
        color: PROVIDER_V2_TOKENS.typography.caption.color,
    },
});
