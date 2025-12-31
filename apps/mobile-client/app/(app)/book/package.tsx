import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useBooking, Package } from '../../../contexts/BookingContext';

const packages: Package[] = [
    { id: 'basic', name: 'Basic', price: 299, duration: '30 min', description: 'Quick service for minor issues' },
    { id: 'deep', name: 'Deep', price: 499, duration: '60 min', description: 'Thorough cleaning and service' },
    { id: 'plan', name: 'Monthly Plan', price: 1999, duration: 'Unlimited', description: 'Unlimited services for a month' },
];

export default function PackageSelectionScreen() {
    const router = useRouter();
    const { booking, updateBooking } = useBooking();
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(booking.package);

    const handleContinue = () => {
        if (selectedPackage) {
            updateBooking({ package: selectedPackage });
            router.push('/(app)/book/slots');
        }
    };

    return (
        <View style={styles.container}>
            {/* Stepper */}
            <View style={styles.stepper}>
                {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={styles.stepperItem}>
                        <View style={[styles.stepperDot, step === 1 && styles.stepperDotActive]} />
                        {step < 4 && <View style={styles.stepperLine} />}
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Package</Text>
                <Text style={styles.subtitle}>Choose the service package that fits your needs</Text>

                {packages.map((pkg) => (
                    <TouchableOpacity
                        key={pkg.id}
                        style={[
                            styles.packageCard,
                            selectedPackage?.id === pkg.id && styles.packageCardSelected,
                        ]}
                        onPress={() => setSelectedPackage(pkg)}
                    >
                        <View style={styles.packageHeader}>
                            <View style={styles.radioOuter}>
                                {selectedPackage?.id === pkg.id && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.packageInfo}>
                                <Text style={[styles.packageName, selectedPackage?.id === pkg.id && styles.packageNameSelected]}>
                                    {pkg.name}
                                </Text>
                                <Text style={styles.packageDescription}>{pkg.description}</Text>
                            </View>
                        </View>
                        <View style={styles.packageFooter}>
                            <Text style={[styles.packagePrice, selectedPackage?.id === pkg.id && styles.packagePriceSelected]}>
                                ₹{pkg.price}
                            </Text>
                            <Text style={styles.packageDuration}>{pkg.duration}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedPackage && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedPackage}
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
    packageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    packageCardSelected: {
        borderColor: CLIENT_V2_TOKENS.colors.gradientStart,
        backgroundColor: 'rgba(247,200,70,0.05)',
    },
    packageHeader: {
        flexDirection: 'row',
        marginBottom: 12,
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
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    packageInfo: {
        flex: 1,
    },
    packageName: {
        fontSize: 18,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 4,
    },
    packageNameSelected: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    packageDescription: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    packageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packagePrice: {
        fontSize: 20,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    packagePriceSelected: {
        color: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    packageDuration: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
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
