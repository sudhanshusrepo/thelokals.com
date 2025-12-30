import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PROVIDER_V2_TOKENS } from '@lokals/design-system';
import { JobAcceptButton } from '../components/JobAcceptButton';

type JobDetailRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;
type JobDetailNavProp = StackNavigationProp<RootStackParamList, 'JobDetail'>;

export const JobDetailV2Screen = () => {
    const route = useRoute<JobDetailRouteProp>();
    const navigation = useNavigation<JobDetailNavProp>();
    const { jobId } = route.params;

    // Mock Data based on ID
    const job = {
        id: jobId || '123',
        service: 'Deep Cleaning (3 BHK)',
        price: '₹1,250',
        date: 'Today, 2:30 PM',
        address: 'B-4/122, Safdarjung Enclave, New Delhi',
        customer: {
            name: 'Rahul Verma',
            rating: 4.8,
            reviews: 12
        },
        items: [
            { name: 'Deep Cleaning (3 BHK)', qty: 1, price: '₹1,250' },
            { name: 'Balcony Cleaning', qty: 1, price: '₹300' }
        ],
        total: '₹1,550'
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Job #{job.id}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Map Placeholder */}
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>Map View</Text>
                    <View style={styles.locationOverlay}>
                        <Text style={styles.locationText}>{job.address}</Text>
                    </View>
                </View>

                {/* Customer Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <View style={styles.customerRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{job.customer.name[0]}</Text>
                        </View>
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{job.customer.name}</Text>
                            <Text style={styles.customerRating}>★ {job.customer.rating} ({job.customer.reviews} reviews)</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                            <Text style={styles.callButtonText}>📞</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Line Items */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Details</Text>
                    {job.items.map((item, index) => (
                        <View key={index} style={styles.lineItem}>
                            <Text style={styles.itemName}>{item.qty}x {item.name}</Text>
                            <Text style={styles.itemPrice}>{item.price}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Earnings</Text>
                        <Text style={styles.totalValue}>{job.total}</Text>
                    </View>
                </View>

                {/* Action Button */}
                <View style={styles.actionContainer}>
                    <JobAcceptButton onAccept={() => {
                        console.log('Job Accepted!');
                        navigation.goBack();
                    }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PROVIDER_V2_TOKENS.colors.bgPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: PROVIDER_V2_TOKENS.spacing.md,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        marginRight: 16,
    },
    backText: {
        fontSize: 16,
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
    },
    title: {
        ...PROVIDER_V2_TOKENS.typography.h2,
    },
    scrollContent: {
        padding: PROVIDER_V2_TOKENS.spacing.lg,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: PROVIDER_V2_TOKENS.radius.card,
        padding: PROVIDER_V2_TOKENS.spacing.lg,
        marginBottom: 24,
        ...PROVIDER_V2_TOKENS.shadows.card,
    },
    mapPlaceholder: {
        height: 180,
        backgroundColor: '#E2E8F0',
        borderRadius: PROVIDER_V2_TOKENS.radius.card,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 24,
    },
    mapText: {
        color: '#64748B',
        fontWeight: '600',
    },
    locationOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 12,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#64748B',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: PROVIDER_V2_TOKENS.colors.gradientStart,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '700',
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
    },
    customerRating: {
        fontSize: 14,
        color: '#F59E0B',
        marginTop: 2,
    },
    callButton: {
        padding: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
    },
    callButtonText: {
        fontSize: 18,
    },
    lineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: '#334155',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: PROVIDER_V2_TOKENS.colors.successGreen,
    },
    actionContainer: {
        alignItems: 'center',
        marginBottom: 40,
    }
});
