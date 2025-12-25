import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const tiers = [
    { id: 'small', name: 'Minor Issue', desc: 'Inspection, small fixes, installation.', price: '₹299' },
    { id: 'standard', name: 'Standard Service', desc: 'General service, cleaning, repairs.', price: '₹499', recommended: true },
    { id: 'major', name: 'Major Repair', desc: 'Part replacement, deep cleaning, complex issues.', price: '₹999+' },
];

export default function ServiceDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [selectedTier, setSelectedTier] = useState('standard');

    const handleBookNow = () => {
        // In a real app, we'd pass the service ID and tier to a booking creation logic
        // For now, we simulate the "Persistent Booking Screen / Live Matching"
        // We'll navigate to a generic booking detail that mimics "Searching..."
        // Or better yet, we might want to create a dedicated "LiveSearch" screen
        // reusing the existing AI loading or creating a new page.
        // For this phase, let's assume we push to the existing booking ID 'new' which handles this state.

        // Navigate to Unified Checkout
        router.push({
            pathname: '/(app)/book/checkout',
            params: {
                serviceId: id,
                serviceName: 'AC Repair & Service', // Dynamic in real app
                tier: selectedTier === 'small' ? 'Minor Issue' : selectedTier === 'standard' ? 'Standard Service' : 'Major Repair',
                price: tiers.find(t => t.id === selectedTier)?.price
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069' }}
                        style={styles.image}
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <FontAwesome name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <LinearGradientOverlay />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>AC Repair & Service</Text>
                    <View style={styles.ratingRow}>
                        <FontAwesome name="star" size={16} color={Colors.amber.DEFAULT} />
                        <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
                    </View>
                    <Text style={styles.description}>
                        Professional AC repair and servicing for all brands. Verified technicians, 30-day warranty on service.
                    </Text>

                    <Text style={styles.sectionTitle}>Select Service Tier</Text>

                    {tiers.map(tier => (
                        <TouchableOpacity
                            key={tier.id}
                            style={[
                                styles.tierCard,
                                selectedTier === tier.id && styles.tierCardSelected
                            ]}
                            onPress={() => setSelectedTier(tier.id)}
                        >
                            <View style={styles.tierHeader}>
                                <Text style={[styles.tierName, selectedTier === tier.id && styles.tierNameSelected]}>
                                    {tier.name}
                                </Text>
                                {tier.recommended && (
                                    <View style={styles.recommendedBadge}>
                                        <Text style={styles.recommendedText}>Most Popular</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.tierDesc}>{tier.desc}</Text>
                            <Text style={[styles.tierPrice, selectedTier === tier.id && styles.tierPriceSelected]}>
                                {tier.price}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Total Estimate</Text>
                    <Text style={styles.totalPrice}>
                        {tiers.find(t => t.id === selectedTier)?.price}
                    </Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const LinearGradientOverlay = () => (
    // Placeholder for where LinearGradient would be if used as overlay
    <View style={styles.overlay} />
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageContainer: {
        height: 250,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.slate[900],
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        marginLeft: 6,
        fontSize: 14,
        color: Colors.slate[600],
        fontWeight: '500',
    },
    description: {
        fontSize: 15,
        color: Colors.slate[600],
        lineHeight: 22,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.slate[900],
        marginBottom: 16,
    },
    tierCard: {
        borderWidth: 1,
        borderColor: Colors.slate[200],
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    tierCardSelected: {
        borderColor: Colors.teal.DEFAULT,
        backgroundColor: Colors.teal[50],
        borderWidth: 2,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    tierName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.slate[800],
    },
    tierNameSelected: {
        color: Colors.teal[900],
    },
    tierDesc: {
        fontSize: 13,
        color: Colors.slate[500],
        marginBottom: 8,
    },
    tierPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.slate[900],
    },
    tierPriceSelected: {
        color: Colors.teal.DEFAULT,
    },
    recommendedBadge: {
        backgroundColor: Colors.amber[100],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    recommendedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.amber[800],
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.slate[100],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 40,
    },
    totalLabel: {
        fontSize: 12,
        color: Colors.slate[400],
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.slate[900],
    },
    bookButton: {
        backgroundColor: Colors.teal.DEFAULT,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
