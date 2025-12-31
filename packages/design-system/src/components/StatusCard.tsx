import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { CLIENT_V2_TOKENS } from '../tokens/client-v2';

export interface StatusCardProps {
    status: string;
    progress: number; // 0-100
    statusMessage: string;
    primaryAction?: { label: string; onPress: () => void };
    secondaryAction?: { label: string; onPress: () => void };
    style?: ViewStyle;
}

/**
 * StatusCard Component
 * 360x120px card showing booking/service status with progress indicator
 */
export const StatusCard: React.FC<StatusCardProps> = ({
    status,
    progress,
    statusMessage,
    primaryAction,
    secondaryAction,
    style
}) => {
    return (
        <View style={[styles.card, style]}>
            {/* Gradient Background */}
            <View style={styles.gradientBackground} />

            <View style={styles.content}>
                {/* Progress Indicator */}
                <View style={styles.progressSection}>
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                </View>

                {/* Status Text */}
                <View style={styles.statusSection}>
                    <Text style={styles.status}>{status}</Text>
                    <Text style={styles.statusMessage}>{statusMessage}</Text>
                </View>

                {/* Action Buttons */}
                {(primaryAction || secondaryAction) && (
                    <View style={styles.actionsSection}>
                        {primaryAction && (
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={primaryAction.onPress}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {primaryAction.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {secondaryAction && (
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={secondaryAction.onPress}
                                activeOpacity={0.6}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    {secondaryAction.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CLIENT_V2_TOKENS.dimensions.statusCard.width,
        height: CLIENT_V2_TOKENS.dimensions.statusCard.height,
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        overflow: 'hidden',
        position: 'relative',
        ...CLIENT_V2_TOKENS.shadows.elevated,
    },
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        // In production, use LinearGradient from expo-linear-gradient
        // colors={[CLIENT_V2_TOKENS.colors.gradientStart, CLIENT_V2_TOKENS.colors.gradientEnd]}
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: CLIENT_V2_TOKENS.spacing.md,
        gap: CLIENT_V2_TOKENS.spacing.md,
    },
    progressSection: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    progressText: {
        fontSize: CLIENT_V2_TOKENS.typography.h2.fontSize,
        fontWeight: CLIENT_V2_TOKENS.typography.h2.fontWeight,
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    statusSection: {
        flex: 1,
        justifyContent: 'center',
    },
    status: {
        fontSize: CLIENT_V2_TOKENS.typography.body.fontSize,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 4,
    },
    statusMessage: {
        fontSize: CLIENT_V2_TOKENS.typography.caption.fontSize,
        fontWeight: CLIENT_V2_TOKENS.typography.caption.fontWeight,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    actionsSection: {
        flexDirection: 'column',
        gap: CLIENT_V2_TOKENS.spacing.xs,
    },
    button: {
        paddingVertical: CLIENT_V2_TOKENS.spacing.xs,
        paddingHorizontal: CLIENT_V2_TOKENS.spacing.md,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    primaryButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: CLIENT_V2_TOKENS.typography.caption.fontSize,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    secondaryButtonText: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        fontSize: CLIENT_V2_TOKENS.typography.caption.fontSize,
        fontWeight: '600',
    },
});
