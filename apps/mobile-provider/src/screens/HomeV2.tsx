import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text, Image } from 'react-native';
import {
    HeroCard,
    EarningsCard,
    JobCard,
    FloatingCta,
    PROVIDER_V2_TOKENS
} from '@lokals/design-system';

export const HomeV2Screen = () => {
    // Mock Data
    const earnings = { status: 'Next Payout' as const, amount: '₹12,450', period: 'Dec 1 - Dec 15' };

    // Mock Jobs
    const jobs = [
        { id: '1', service: 'Deep Cleaning', location: 'Model Town, Delhi', time: 'Today, 2:00 PM', price: '₹850' },
        { id: '2', service: 'AC Service', location: 'Rohini Sec 14', time: 'Tomorrow, 10:00 AM', price: '₹1,200' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>Sudhanshu</Text>
                    </View>
                    <View style={styles.avatarPlaceholder} />
                </View>

                {/* Earnings Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <EarningsCard
                        status={earnings.status}
                        amount={earnings.amount}
                        period={earnings.period}
                        style={{ width: '100%' }} // Override width to full
                    />
                </View>

                {/* Critical Action */}
                <View style={styles.section}>
                    <HeroCard
                        title="Complete Profile"
                        subtitle="Add your bank details to receive payouts."
                        primaryCta={{ label: "Add Check", onPress: () => console.log('Add Bank') }}
                        style={{ width: '100%' }} // Responsive override
                    />
                </View>

                {/* Recent Jobs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>New Requests</Text>
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            serviceName={job.service}
                            location={job.location}
                            time={job.time}
                            price={job.price}
                            onAccept={() => console.log('Accept', job.id)}
                            style={{ marginBottom: 12, width: '100%' }}
                        />
                    ))}
                </View>

                {/* Spacer for Floating CTA */}
                <View style={{ height: 80 }} />
            </ScrollView>

            <FloatingCta
                onPress={() => console.log('Go Online')}
                variant="active"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PROVIDER_V2_TOKENS.colors.bgPrimary,
    },
    scrollContent: {
        padding: PROVIDER_V2_TOKENS.spacing.lg,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: PROVIDER_V2_TOKENS.spacing.xl,
        marginTop: PROVIDER_V2_TOKENS.spacing.md,
    },
    greeting: {
        ...PROVIDER_V2_TOKENS.typography.label,
    },
    name: {
        ...PROVIDER_V2_TOKENS.typography.h2,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
    },
    section: {
        marginBottom: PROVIDER_V2_TOKENS.spacing.xl,
    },
    sectionTitle: {
        ...PROVIDER_V2_TOKENS.typography.h2,
        fontSize: 18,
        marginBottom: PROVIDER_V2_TOKENS.spacing.md,
    },
});
