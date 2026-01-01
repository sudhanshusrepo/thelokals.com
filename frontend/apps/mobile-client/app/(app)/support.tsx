import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { Card } from '@/components/shared';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function SupportScreen() {
    const router = useRouter();

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@thelokals.com');
    };

    const handleCallSupport = () => {
        Linking.openURL('tel:+1234567890');
    };

    const handleFaq = () => {
        Linking.openURL('https://thelokals.com/faq');
    };

    const supportOptions = [
        {
            icon: 'envelope',
            title: 'Email Support',
            subtitle: 'Get help via email',
            action: handleEmailSupport,
            color: colors.statusInfo,
            bg: '#eff6ff',
        },
        {
            icon: 'phone',
            title: 'Call Us',
            subtitle: 'Speak to an agent',
            action: handleCallSupport,
            color: colors.primary,
            bg: colors.primaryLight,
        },
        {
            icon: 'question-circle',
            title: 'FAQs',
            subtitle: 'Common questions',
            action: handleFaq,
            color: colors.textSecondary,
            bg: colors.bgCard,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <Text style={styles.headerSubtitle}>We're here to help you with anything you need.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.optionsContainer}>
                    {supportOptions.map((option, index) => (
                        <Card
                            key={index}
                            style={styles.optionCard}
                            onPress={option.action}
                        >
                            <View style={[styles.iconBox, { backgroundColor: option.bg }]}>
                                <FontAwesome name={option.icon as any} size={20} color={option.color} />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={colors.borderMedium} />
                        </Card>
                    ))}
                </View>

                <View style={styles.legalSection}>
                    <Text style={styles.sectionLabel}>LEGAL</Text>
                    <View style={styles.legalLinks}>
                        <TouchableOpacity style={styles.legalLink} onPress={() => router.push('/(app)/terms')}>
                            <Text style={styles.legalText}>Terms & Conditions</Text>
                            <FontAwesome name="external-link" size={12} color={Colors.slate[400]} />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.legalLink} onPress={() => router.push('/(app)/privacy')}>
                            <Text style={styles.legalText}>Privacy Policy</Text>
                            <FontAwesome name="external-link" size={12} color={Colors.slate[400]} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>Version 1.0.0</Text>
                    <Text style={styles.coy}>© 2025 Lokals</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.slate[50],
    },
    header: {
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.slate[900],
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.slate[500],
    },
    content: {
        padding: 16,
    },
    optionsContainer: {
        marginBottom: 32,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.slate[900],
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 14,
        color: Colors.slate[500],
    },
    legalSection: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.slate[400],
        letterSpacing: 1,
        marginBottom: 12,
        paddingLeft: 8,
    },
    legalLinks: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.slate[200],
        overflow: 'hidden',
    },
    legalLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    legalText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.slate[700],
    },
    divider: {
        height: 1,
        backgroundColor: Colors.slate[100],
    },
    footer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    version: {
        fontSize: 12,
        color: Colors.slate[400],
    },
    coy: {
        fontSize: 10,
        color: Colors.slate[300],
        marginTop: 4,
    },
});
