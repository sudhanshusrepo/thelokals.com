import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CLIENT_V2_TOKENS, StatusCard } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useBooking } from '../../../contexts/BookingContext';

export default function SuccessScreen() {
    const router = useRouter();
    const { booking, resetBooking } = useBooking();

    const handleTrackBooking = () => {
        router.push('/(app)/bookings');
    };

    const handleBookAnother = () => {
        resetBooking();
        router.push('/(app)/services');
    };

    return (
        <View style={styles.container}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
                <LinearGradient
                    colors={[CLIENT_V2_TOKENS.colors.gradientStart, CLIENT_V2_TOKENS.colors.gradientEnd]}
                    style={styles.iconCircle}
                >
                    <Text style={styles.checkmark}>✓</Text>
                </LinearGradient>
            </View>

            {/* Success Message */}
            <Text style={styles.title}>Booking Confirmed!</Text>
            <Text style={styles.subtitle}>
                Your service has been booked successfully. We're assigning the best provider for you.
            </Text>

            {/* Booking Details */}
            <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Booking Details</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service</Text>
                    <Text style={styles.detailValue}>{booking.service?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Package</Text>
                    <Text style={styles.detailValue}>{booking.package?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>{booking.slot?.time}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{booking.address?.name}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailTotalLabel}>Total Paid</Text>
                    <Text style={styles.detailTotalValue}>₹{booking.total}</Text>
                </View>
            </View>

            {/* Provider Assignment Status */}
            <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Assigning best provider...</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleTrackBooking}>
                    <Text style={styles.primaryButtonText}>Track Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleBookAnother}>
                    <Text style={styles.secondaryButtonText}>Book Another Service</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        padding: 20,
        paddingTop: 80,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        fontSize: 60,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 12,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 20,
        width: '100%',
        marginBottom: 24,
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 16,
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(138,233,141,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: CLIENT_V2_TOKENS.radius.pill,
        marginBottom: 32,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8AE98D',
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    actions: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
        padding: 16,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        padding: 16,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: CLIENT_V2_TOKENS.colors.textTertiary,
    },
    secondaryButtonText: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
});
