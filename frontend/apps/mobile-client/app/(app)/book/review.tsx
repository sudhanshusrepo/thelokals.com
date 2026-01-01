import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CLIENT_V2_TOKENS, StatusCard } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useBooking, PaymentMethod } from '../../../contexts/BookingContext';

const paymentMethods: { id: PaymentMethod; name: string; icon: string }[] = [
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'cash', name: 'Cash', icon: '💵' },
];

export default function ReviewPayScreen() {
    const router = useRouter();
    const { booking, updateBooking, calculateTotal } = useBooking();
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');

    const basePrice = booking.package?.price || 0;
    const addonsPrice = booking.addons.reduce((sum, a) => sum + a.price, 0);
    const subtotal = basePrice + addonsPrice;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const handleConfirmPay = () => {
        updateBooking({ paymentMethod: selectedPayment, total });
        // In production: call API to create booking
        router.push('/(app)/book/success');
    };

    return (
        <View style={styles.container}>
            {/* Stepper */}
            <View style={styles.stepper}>
                {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={styles.stepperItem}>
                        <View style={[styles.stepperDot, styles.stepperDotActive]} />
                        {step < 4 && <View style={[styles.stepperLine, styles.stepperLineActive]} />}
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Review & Pay</Text>
                <Text style={styles.subtitle}>Confirm your booking details</Text>

                {/* Booking Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.sectionTitle}>Booking Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service</Text>
                        <Text style={styles.summaryValue}>{booking.service?.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Package</Text>
                        <Text style={styles.summaryValue}>{booking.package?.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date & Time</Text>
                        <Text style={styles.summaryValue}>{booking.slot?.time || 'Not selected'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Address</Text>
                        <Text style={styles.summaryValue}>{booking.address?.name}</Text>
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={styles.priceCard}>
                    <Text style={styles.sectionTitle}>Price Breakdown</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Service ({booking.package?.name})</Text>
                        <Text style={styles.priceValue}>₹{basePrice}</Text>
                    </View>
                    {booking.addons.map((addon) => (
                        <View key={addon.id} style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Add-on: {addon.name}</Text>
                            <Text style={styles.priceValue}>₹{addon.price}</Text>
                        </View>
                    ))}
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tax (10%)</Text>
                        <Text style={styles.priceValue}>₹{tax}</Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.priceTotalLabel}>Total</Text>
                        <Text style={styles.priceTotalValue}>₹{total}</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentChip,
                                selectedPayment === method.id && styles.paymentChipSelected,
                            ]}
                            onPress={() => setSelectedPayment(method.id)}
                        >
                            <Text style={styles.paymentIcon}>{method.icon}</Text>
                            <Text
                                style={[
                                    styles.paymentText,
                                    selectedPayment === method.id && styles.paymentTextSelected,
                                ]}
                            >
                                {method.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalPrice}>₹{total}</Text>
                </View>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPay}>
                    <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    stepper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
    },
    stepperItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepperDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DDD',
    },
    stepperDotActive: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    stepperLine: {
        width: 40,
        height: 2,
        backgroundColor: '#DDD',
        marginHorizontal: 4,
    },
    stepperLineActive: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 8,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
    },
    subtitle: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        marginBottom: 24,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    priceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        marginBottom: 24,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    priceDivider: {
        height: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        marginVertical: 12,
    },
    priceTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    priceTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    paymentMethods: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    paymentChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        padding: 16,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentChipSelected: {
        borderColor: CLIENT_V2_TOKENS.colors.gradientStart,
        backgroundColor: 'rgba(247,200,70,0.1)',
    },
    paymentIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    paymentTextSelected: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    totalLabel: {
        fontSize: 12,
        color: CLIENT_V2_TOKENS.colors.textTertiary,
        marginBottom: 4,
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    confirmButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
