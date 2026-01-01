import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CLIENT_V2_TOKENS, ProviderBlindBadge } from '@lokals/design-system';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock booking data
const mockBooking = {
    id: '1',
    service: 'Deep Cleaning',
    package: 'Deep',
    date: 'Today, 2:30 PM',
    address: 'Home - 123 Main St, Narnaund',
    price: 499,
    status: 'assigned',
    timeline: [
        { step: 'requested', label: 'Requested', completed: true },
        { step: 'assigned', label: 'Assigned', completed: true, active: true },
        { step: 'on_the_way', label: 'On the way', completed: false },
        { step: 'in_progress', label: 'In progress', completed: false },
        { step: 'completed', label: 'Completed', completed: false },
    ],
    provider: {
        rating: 4.9,
        estimatedArrival: '15 min',
    },
};

export default function BookingDetailV2Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Timeline */}
            <View style={styles.timelineCard}>
                <Text style={styles.sectionTitle}>Progress</Text>
                <View style={styles.timeline}>
                    {mockBooking.timeline.map((item, index) => (
                        <View key={item.step} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[
                                    styles.timelineDot,
                                    item.completed && styles.timelineDotCompleted,
                                    item.active && styles.timelineDotActive,
                                ]} />
                                {index < mockBooking.timeline.length - 1 && (
                                    <View style={[
                                        styles.timelineLine,
                                        item.completed && styles.timelineLineCompleted,
                                    ]} />
                                )}
                            </View>
                            <Text style={[
                                styles.timelineLabel,
                                item.completed && styles.timelineLabelCompleted,
                                item.active && styles.timelineLabelActive,
                            ]}>
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Provider Card */}
            <View style={styles.providerCard}>
                <ProviderBlindBadge message="Best provider assigned" />
                <View style={styles.providerInfo}>
                    <View style={styles.providerRow}>
                        <Text style={styles.providerLabel}>Rating</Text>
                        <Text style={styles.providerValue}>⭐ {mockBooking.provider.rating}</Text>
                    </View>
                    <View style={styles.providerRow}>
                        <Text style={styles.providerLabel}>Est. Arrival</Text>
                        <Text style={styles.providerValue}>{mockBooking.provider.estimatedArrival}</Text>
                    </View>
                </View>
            </View>

            {/* Service Details */}
            <View style={styles.detailsCard}>
                <Text style={styles.sectionTitle}>Service Details</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service</Text>
                    <Text style={styles.detailValue}>{mockBooking.service}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Package</Text>
                    <Text style={styles.detailValue}>{mockBooking.package}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>{mockBooking.date}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{mockBooking.address}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailTotalLabel}>Total</Text>
                    <Text style={styles.detailTotalValue}>₹{mockBooking.price}</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>📞</Text>
                    <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                    <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    timelineCard: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 20,
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 16,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#DDD',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    timelineDotCompleted: {
        backgroundColor: '#8AE98D',
    },
    timelineDotActive: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    timelineLine: {
        width: 2,
        height: 40,
        backgroundColor: '#DDD',
    },
    timelineLineCompleted: {
        backgroundColor: '#8AE98D',
    },
    timelineLabel: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textTertiary,
        paddingTop: 2,
    },
    timelineLabelCompleted: {
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    timelineLabelActive: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        fontWeight: '600',
    },
    providerCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    providerInfo: {
        marginTop: 16,
    },
    providerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    providerLabel: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    providerValue: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        flex: 1,
        textAlign: 'right',
    },
    detailDivider: {
        height: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        marginVertical: 12,
    },
    detailTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    detailTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        borderWidth: 2,
        borderColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    cancelButton: {
        borderColor: '#FF6B6B',
        width: '100%',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
    },
});
