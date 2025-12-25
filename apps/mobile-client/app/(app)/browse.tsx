import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { ServiceCard } from '@/components/browse/ServiceCard';

const services = [
    { id: '1', name: 'AC Repair & Service', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069', rating: 4.8, reviews: 120, priceStart: '₹499', type: 'offline' },
    { id: '2', name: 'Bathroom Cleaning', image: 'https://images.unsplash.com/photo-1581578731117-104f2a921a29?q=80&w=200', rating: 4.9, reviews: 85, priceStart: '₹399', type: 'offline' },
    { id: '3', name: 'Salon for Men', image: 'https://images.unsplash.com/photo-1503951914875-befea74701c5?q=80&w=2068', rating: 4.7, reviews: 200, priceStart: '₹299', type: 'offline' },
    { id: '4', name: 'Electrician', image: 'https://images.unsplash.com/photo-1621905252507-b35a5db01de8?q=80&w=2069', rating: 4.6, reviews: 90, priceStart: '₹199', type: 'offline' },
    { id: '5', name: 'Online Yoga Class', image: '', rating: 5.0, reviews: 40, priceStart: '₹500', type: 'online' },
    { id: '6', name: 'Legal Consultant', image: '', rating: 4.9, reviews: 15, priceStart: '₹1000', type: 'online' },
];

export default function BrowseScreen() {
    const router = useRouter();
    const { category } = useLocalSearchParams();
    const [mode, setMode] = useState<'online' | 'offline'>('offline');

    const filteredServices = services.filter(s => {
        const matchesMode = s.type === mode;
        const matchesCategory = category ? s.name.toLowerCase().includes((category as string).toLowerCase()) : true;
        return matchesMode && matchesCategory;
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={Colors.slate[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {category ? `${category} Services` : 'Browse Services'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleBtn, mode === 'offline' && styles.toggleBtnActive]}
                    onPress={() => setMode('offline')}
                >
                    <Text style={[styles.toggleText, mode === 'offline' && styles.toggleTextActive]}>Offline (In-Person)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleBtn, mode === 'online' && styles.toggleBtnActive]}
                    onPress={() => setMode('online')}
                >
                    <Text style={[styles.toggleText, mode === 'online' && styles.toggleTextActive]}>Online (Remote)</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {mode === 'offline' ? (
                    <View style={styles.grid}>
                        {filteredServices.map(service => (
                            <ServiceCard
                                key={service.id}
                                {...service}
                                isOnline={false}
                                onPress={() => router.push(`/(app)/service/${service.id}` as any)}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.list}>
                        {filteredServices.map(service => (
                            <ServiceCard
                                key={service.id}
                                {...service}
                                isOnline={true}
                                onPress={() => router.push(`/(app)/service/${service.id}` as any)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.slate[900],
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: Colors.slate[200],
    },
    toggleBtnActive: {
        borderBottomColor: Colors.teal.DEFAULT,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.slate[500],
    },
    toggleTextActive: {
        color: Colors.teal.DEFAULT,
    },
    scrollContent: {
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    list: {
        flexDirection: 'column',
    }
});
