import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
    HeroCard,
    EarningsCard,
    JobCard,
    FloatingCta,
    PROVIDER_V2_TOKENS
} from '@lokals/design-system';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { JobAcceptButton } from '../components/JobAcceptButton';
import { OfflineBanner } from '../components/OfflineBanner';

type HomeNavProp = StackNavigationProp<RootStackParamList>;

export const HomeV2Screen = () => {
    const navigation = useNavigation<HomeNavProp>();
    const [loading, setLoading] = useState(true);

    // Mock Data
    const earnings = { status: 'Next Payout' as const, amount: '₹12,450', period: 'Dec 1 - Dec 15' };

    // Mock Jobs
    const jobs = [
        { id: '1', service: 'Deep Cleaning', location: 'Model Town, Delhi', time: 'Today, 2:00 PM', price: '₹850' },
        { id: '2', service: 'AC Service', location: 'Rohini Sec 14', time: 'Tomorrow, 10:00 AM', price: '₹1,200' },
        { id: '3', service: 'Plumbing', location: 'Pitampura', time: 'Today, 5:00 PM', price: '₹500' },
    ];

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000); // Simulate load
    }, []);

    const renderJobItem = ({ item }: { item: typeof jobs[0] }) => (
        <View style={styles.jobWrapper}>
            <JobCard
                serviceName={item.service}
                location={item.location}
                time={item.time}
                price={item.price}
                onAccept={() => navigation.navigate('JobDetail', { jobId: item.id })}
                style={{ width: '100%' }}
            />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ padding: 20 }}>
                    <SkeletonLoader height={200} style={{ marginBottom: 20 }} />
                    <SkeletonLoader height={100} style={{ marginBottom: 20 }} />
                    <SkeletonLoader height={150} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <OfflineBanner />
            <FlatList
                data={jobs}
                keyExtractor={item => item.id}
                renderItem={renderJobItem}
                ListHeaderComponent={
                    <>
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
                                style={{ width: '100%' }}
                            />
                        </View>

                        {/* Critical Action */}
                        <View style={styles.section}>
                            <HeroCard
                                title="Complete Profile"
                                subtitle="Add your bank details to receive payouts."
                                primaryCta={{ label: "Add Check", onPress: () => console.log('Add Bank') }}
                                style={{ width: '100%' }}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>New Requests</Text>
                    </>
                }
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
                ListFooterComponent={<View style={{ height: 80 }} />}
            />

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
    jobWrapper: {
        marginBottom: 12,
        width: '100%',
    }
});
