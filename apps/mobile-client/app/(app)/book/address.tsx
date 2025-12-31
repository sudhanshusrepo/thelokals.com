import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useBooking, Address } from '../../../contexts/BookingContext';

// Mock saved addresses
const mockAddresses: Address[] = [
    { id: '1', name: 'Home', address: '123 Main St, Narnaund', city: 'Narnaund', pincode: '126115', isDefault: true },
    { id: '2', name: 'Office', address: '456 Business Park, Hisar', city: 'Hisar', pincode: '125001', isDefault: false },
];

export default function AddressSelectionScreen() {
    const router = useRouter();
    const { booking, updateBooking } = useBooking();
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(booking.address || mockAddresses[0]);
    const [instructions, setInstructions] = useState('');

    const handleContinue = () => {
        if (selectedAddress) {
            updateBooking({ address: selectedAddress });
            router.push('/(app)/book/review');
        }
    };

    return (
        <View style={styles.container}>
            {/* Stepper */}
            <View style={styles.stepper}>
                {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={styles.stepperItem}>
                        <View style={[styles.stepperDot, step <= 3 && styles.stepperDotActive]} />
                        {step < 4 && <View style={[styles.stepperLine, step < 3 && styles.stepperLineActive]} />}
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Address</Text>
                <Text style={styles.subtitle}>Where should we provide the service?</Text>

                {/* Saved Addresses */}
                {mockAddresses.map((addr) => (
                    <TouchableOpacity
                        key={addr.id}
                        style={[
                            styles.addressCard,
                            selectedAddress?.id === addr.id && styles.addressCardSelected,
                        ]}
                        onPress={() => setSelectedAddress(addr)}
                    >
                        <View style={styles.radioOuter}>
                            {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.addressInfo}>
                            <View style={styles.addressHeader}>
                                <Text style={styles.addressName}>{addr.name}</Text>
                                {addr.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>Default</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.addressText}>{addr.address}</Text>
                            <Text style={styles.addressCity}>{addr.city} - {addr.pincode}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add New Address */}
                <TouchableOpacity style={styles.addNewButton}>
                    <Text style={styles.addNewIcon}>+</Text>
                    <Text style={styles.addNewText}>Add New Address</Text>
                </TouchableOpacity>

                {/* Special Instructions */}
                <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
                <TextInput
                    style={styles.instructionsInput}
                    placeholder="E.g., Ring the doorbell twice, parking instructions..."
                    placeholderTextColor={CLIENT_V2_TOKENS.colors.textTertiary}
                    value={instructions}
                    onChangeText={setInstructions}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedAddress && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedAddress}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
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
    addressCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    addressCardSelected: {
        borderColor: CLIENT_V2_TOKENS.colors.gradientStart,
        backgroundColor: 'rgba(247,200,70,0.05)',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: CLIENT_V2_TOKENS.colors.textTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    addressInfo: {
        flex: 1,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    addressText: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        marginBottom: 2,
    },
    addressCity: {
        fontSize: 12,
        color: CLIENT_V2_TOKENS.colors.textTertiary,
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        borderStyle: 'dashed',
    },
    addNewIcon: {
        fontSize: 20,
        color: CLIENT_V2_TOKENS.colors.gradientStart,
        marginRight: 8,
    },
    addNewText: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 12,
    },
    instructionsInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        minHeight: 100,
        borderWidth: 1,
        borderColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    continueButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
        padding: 16,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#CCC',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
