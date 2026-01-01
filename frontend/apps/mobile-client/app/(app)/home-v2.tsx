import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroCard, ServiceCard, StatusCard, ProviderBlindBadge, CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useClientDesign } from '../../../hooks/useClientDesign';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data - replace with real API calls
const mockServices = [
    {
        id: '1',
        serviceImage: 'https://via.placeholder.com/160x120',
        title: 'Deep Cleaning',
        price: '₹499',
        rating: 4.9,
        isBestMatch: true
    },
    {
        id: '2',
        serviceImage: 'https://via.placeholder.com/160x120',
        title: 'Plumbing Repair',
        price: '₹299',
        rating: 4.8
    },
    {
        id: '3',
        serviceImage: 'https://via.placeholder.com/160x120',
        title: 'Electrical Fix',
        price: '₹399',
        rating: 4.7
    },
    {
        id: '4',
        serviceImage: 'https://via.placeholder.com/160x120',
        title: 'Salon at Home',
        price: '₹599',
        rating: 4.9
    },
];

const quickActions = ['cleaning', 'repair', 'beauty', 'appliances', 'more'];

export default function HomeScreenV2() {
    const router = useRouter();
    const location = 'Narnaund, Haryana';

    return (
        <ScrollView style={styles.container}>
            {/* AppBar */}
            <LinearGradient
                colors={['#0E121A', '#1A1F2A']}
                style={styles.appBar}
            >
                <View style={styles.appBarContent}>
                    <View style={styles.locationSection}>
                        <Image
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.locationLabel}>Current Location</Text>
                            <Text style={styles.locationText}>lokals, {location}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.bellIcon}>🔔</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* HeroCard */}
            <View style={styles.heroSection}>
                <HeroCard
                    variant="client"
                    title="welcome back"
                    subtitle="best providers assigned instantly"
                    primaryCta={{
                        label: "book service",
                        onPress: () => router.push('/(app)/browse')
                    }}
                    secondaryCta={{
                        label: "my plan",
                        onPress: () => router.push('/(app)/profile')
                    }}
                />

                <View style={styles.badgeContainer}>
                    <ProviderBlindBadge message="Best provider assigned instantly" />
                </View>
            </View>

            {/* QuickActions */}
            <View style={styles.quickActionsSection}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={quickActions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push({
                                pathname: '/(app)/browse',
                                params: { category: item }
                            })}
                        >
                            <Text style={styles.quickActionText}>
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Next Booking / Status */}
            <View style={styles.nextBookingSection}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {/* Empty state - replace with StatusCard when booking exists */}
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyTitle}>No active bookings</Text>
                    <Text style={styles.emptyDescription}>Book your first service today!</Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => router.push('/(app)/browse')}
                    >
                        <Text style={styles.emptyButtonText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Popular Services Grid */}
            <View style={styles.servicesSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Services</Text>
                    <TouchableOpacity onPress={() => router.push('/(app)/browse')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.servicesGrid}>
                    {mockServices.map((service) => (
                        <View key={service.id} style={styles.serviceCardWrapper}>
                            <ServiceCard
                                serviceImage={service.serviceImage}
                                title={service.title}
                                price={service.price}
                                rating={service.rating}
                                isBestMatch={service.isBestMatch}
                                onPress={() => router.push({
                                    pathname: '/(app)/service/[id]',
                                    params: { id: service.id }
                                })}
                            />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    appBar: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    appBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    locationLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    locationText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    bellIcon: {
        fontSize: 24,
    },
    heroSection: {
        padding: 16,
    },
    badgeContainer: {
        marginTop: 12,
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    quickActionButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: CLIENT_V2_TOKENS.radius.pill,
        marginRight: 12,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    nextBookingSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 16,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 24,
        alignItems: 'center',
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    emptyIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 4,
    },
    emptyDescription: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: CLIENT_V2_TOKENS.radius.pill,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    servicesSection: {
        paddingHorizontal: 16,
        marginBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: CLIENT_V2_TOKENS.colors.accentDanger,
        fontWeight: '600',
        fontSize: 14,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    serviceCardWrapper: {
        width: (width - 48) / 2, // 2 columns with padding
        padding: 8,
    },
});
