import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';
import { CLIENT_V2_TOKENS } from '../tokens/client-v2';

export interface HeroCardProps {
    title: string;
    subtitle: string;
    primaryCta: { label: string; onPress: () => void };
    secondaryCta?: { label: string; onPress: () => void };
    variant?: 'provider' | 'client';
    style?: ViewStyle;
}

export const HeroCard: React.FC<HeroCardProps> = ({
    title,
    subtitle,
    primaryCta,
    secondaryCta,
    variant = 'provider',
    style
}) => {
    const tokens = variant === 'client' ? CLIENT_V2_TOKENS : PROVIDER_V2_TOKENS;
    const cardStyle = {
        ...styles.card,
        borderRadius: tokens.radius.hero,
        ...tokens.shadows.card,
    };

    const gradientStyle = {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: tokens.colors.gradientStart,
    };

    const contentStyle = {
        ...styles.content,
        padding: tokens.spacing.xl,
    };

    return (
        <View style={[cardStyle, style]}>
            {/* Placeholder for Gradient - In real app use expo-linear-gradient */}
            <View style={gradientStyle} />

            <View style={contentStyle}>
                <Text style={[styles.title, {
                    fontSize: tokens.typography.h1.fontSize,
                    fontWeight: tokens.typography.h1.fontWeight,
                    color: tokens.typography.h1.color,
                }]}>{title}</Text>
                <Text style={[styles.subtitle, {
                    fontSize: tokens.typography.body.fontSize,
                    fontWeight: tokens.typography.body.fontWeight,
                    color: tokens.typography.body.color,
                }]}>{subtitle}</Text>

                <View style={[styles.actions, { gap: tokens.spacing.md }]}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, {
                            paddingVertical: tokens.spacing.sm,
                            paddingHorizontal: tokens.spacing.lg,
                            borderRadius: tokens.radius.button,
                            backgroundColor: tokens.colors.accentDanger,
                        }]}
                        onPress={primaryCta.onPress}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.primaryButtonText, {
                            fontSize: tokens.typography.label.fontSize,
                            fontWeight: tokens.typography.label.fontWeight,
                        }]}>{primaryCta.label}</Text>
                    </TouchableOpacity>

                    {secondaryCta && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton, {
                                paddingVertical: tokens.spacing.sm,
                                paddingHorizontal: tokens.spacing.lg,
                                borderRadius: tokens.radius.button,
                            }]}
                            onPress={secondaryCta.onPress}
                            activeOpacity={0.6}
                        >
                            <Text style={[styles.secondaryButtonText, {
                                fontSize: tokens.typography.label.fontSize,
                                fontWeight: tokens.typography.label.fontWeight,
                                color: tokens.colors.textPrimary,
                            }]}>{secondaryCta.label}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        maxWidth: 420,
        height: 240,
        borderRadius: PROVIDER_V2_TOKENS.radius.hero,
        overflow: 'hidden',
        position: 'relative',
        // Shadow for iOS/Android
        ...PROVIDER_V2_TOKENS.shadows.card,
    },
    gradientFallback: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: PROVIDER_V2_TOKENS.colors.gradientStart, // Fallback
        // Ideally use <LinearGradient colors={[start, end]} /> here
    },
    content: {
        flex: 1,
        padding: PROVIDER_V2_TOKENS.spacing.xl,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: PROVIDER_V2_TOKENS.typography.h1.fontSize,
        fontWeight: PROVIDER_V2_TOKENS.typography.h1.fontWeight,
        color: PROVIDER_V2_TOKENS.typography.h1.color,
        marginBottom: PROVIDER_V2_TOKENS.spacing.xs,
    },
    subtitle: {
        fontSize: PROVIDER_V2_TOKENS.typography.body.fontSize,
        fontWeight: PROVIDER_V2_TOKENS.typography.body.fontWeight,
        color: PROVIDER_V2_TOKENS.typography.body.color,
    },
    actions: {
        flexDirection: 'row',
        gap: PROVIDER_V2_TOKENS.spacing.md,
    },
    button: {
        paddingVertical: PROVIDER_V2_TOKENS.spacing.sm,
        paddingHorizontal: PROVIDER_V2_TOKENS.spacing.lg,
        borderRadius: PROVIDER_V2_TOKENS.radius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: PROVIDER_V2_TOKENS.colors.accentDanger,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: PROVIDER_V2_TOKENS.typography.label.fontSize,
        fontWeight: PROVIDER_V2_TOKENS.typography.label.fontWeight,
    },
    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    secondaryButtonText: {
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
        fontSize: PROVIDER_V2_TOKENS.typography.label.fontSize,
        fontWeight: PROVIDER_V2_TOKENS.typography.label.fontWeight,
    },
});
