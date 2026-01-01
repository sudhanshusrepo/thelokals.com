import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type RegNavProp = StackNavigationProp<OnboardingStackParamList, 'RegistrationForm'>;

export default function RegistrationFormScreen() {
    const navigation = useNavigation<RegNavProp>();

    // Using similar state to Availability Screen for Services/Radius
    const [services, setServices] = useState<Record<string, boolean>>({
        cleaning: false,
        plumbing: false,
        electrical: false,
    });
    const [radius, setRadius] = useState(10);
    const [upiId, setUpiId] = useState('');

    const serviceOptions = [
        { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
        { id: 'plumbing', label: 'Plumbing', icon: '🚿' },
        { id: 'electrical', label: 'Electrical', icon: '🔌' },
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F0F0F0' }} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Complete Registration</Text>

            <Text style={styles.sectionTitle}>Select Services</Text>
            <View style={styles.servicesGrid}>
                {serviceOptions.map(service => (
                    <TouchableOpacity
                        key={service.id}
                        onPress={() => setServices({ ...services, [service.id]: !services[service.id] })}
                        style={[styles.serviceCard, services[service.id] && styles.serviceCardActive]}
                    >
                        <Text style={styles.serviceIcon}>{service.icon}</Text>
                        <Text style={[styles.serviceLabel, services[service.id] && styles.serviceLabelActive]}>
                            {service.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Service Radius</Text>
            <View style={styles.card}>
                <Text style={styles.value}>{radius} km</Text>
                {/* Simplified Slider Placeholder */}
                <View style={styles.sliderTrack}>
                    <View style={[styles.sliderFill, { width: `${(radius / 20) * 100}%` }]} />
                </View>
                <View style={styles.sliderLabels}>
                    <Text>5km</Text>
                    <Text>20km</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Payment Details</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                value={upiId}
                onChangeText={setUpiId}
            />

            <TouchableOpacity
                style={styles.submitButton}
                onPress={() => navigation.replace('PendingApproval')}
            >
                <Text style={styles.submitText}>Submit for Approval</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24, paddingBottom: 40, maxWidth: 600, alignSelf: 'center', width: '100%' },
    title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#0E121A' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 12, color: '#0E121A' },
    servicesGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    serviceCard: { padding: 16, backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', width: '30%', justifyContent: 'center' },
    serviceCardActive: { backgroundColor: '#F7C846' },
    serviceIcon: { fontSize: 24, marginBottom: 8 },
    serviceLabel: { fontSize: 12, color: '#666' },
    serviceLabelActive: { color: '#0E121A', fontWeight: '700' },
    card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12 },
    value: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
    sliderTrack: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
    sliderFill: { height: '100%', backgroundColor: '#F7C846' },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', opacity: 0.6 },
    input: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#DDD' },
    submitButton: { backgroundColor: '#0E121A', padding: 20, borderRadius: 16, marginTop: 32, alignItems: 'center' },
    submitText: { color: '#FFF', fontSize: 18, fontWeight: '700' }
});
