import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';

export interface JobCardProps {
    serviceName: string;
    location: string;
    time: string;
    price: string;
    onAccept: () => void;
    style?: ViewStyle;
}

export const JobCard: React.FC<JobCardProps> = ({
    serviceName,
    location,
    time,
    price,
    onAccept,
    style
}) => {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.serviceName}>{serviceName}</Text>
                    <Text style={styles.details}>{location} • {time}</Text>
                </View>
                <Text style={styles.price}>{price}</Text>
            </View>

            <TouchableOpacity
                style={styles.acceptButton}
                onPress={onAccept}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>Accept Job</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        maxWidth: 360,
        height: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: PROVIDER_V2_TOKENS.radius.card,
        padding: PROVIDER_V2_TOKENS.spacing.md,
        ...PROVIDER_V2_TOKENS.shadows.card,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    serviceName: {
        fontSize: PROVIDER_V2_TOKENS.typography.h2.fontSize,
        fontWeight: PROVIDER_V2_TOKENS.typography.h2.fontWeight as any, // Cast for TS
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
        marginBottom: 4,
    },
    details: {
        fontSize: PROVIDER_V2_TOKENS.typography.body.fontSize,
        color: PROVIDER_V2_TOKENS.typography.caption.color,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: PROVIDER_V2_TOKENS.colors.successGreen,
    },
    acceptButton: {
        backgroundColor: PROVIDER_V2_TOKENS.colors.textPrimary, // Or accent? Using Primary for contrast
        paddingVertical: PROVIDER_V2_TOKENS.spacing.sm,
        borderRadius: PROVIDER_V2_TOKENS.radius.button,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: PROVIDER_V2_TOKENS.typography.label.fontSize,
        fontWeight: '600',
    },
});
