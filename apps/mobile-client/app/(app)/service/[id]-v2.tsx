import React, { useState } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CLIENT_V2_TOKENS, ProviderBlindBadge, FloatingCta } from '@lokals/design-system';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBooking, Addon } from '../../../contexts/BookingContext';
import { useClientDesign } from '../../../hooks/useClientDesign';

const { width } = Dimensions.get('window');

// Mock service data
const mockServiceData = {
    id: '1',
    name: 'Deep Cleaning',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069',
    price: 499,
    duration: '60 min',
    rating: 4.9,
    reviews: 127,
    category: 'cleaning',
    description: 'Professional deep cleaning service for your home',
    included: [
        'Dusting and wiping all surfaces',
        'Vacuum and mop all floors',
        'Kitchen deep clean',
        'Bathroom sanitization',
        'Balcony cleaning',
    ],
    addons: [
        { id: 'addon1', name: 'Sofa Cleaning', price: 200 },
        { id: 'addon2', name: 'Carpet Cleaning', price: 150 },
        { id: 'addon3', name: 'Window Cleaning', price: 100 },
    ],
};

export default function ServiceDetailV2Screen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { updateBooking } = useBooking();
    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

    const service = mockServiceData;

    const toggleAddon = (addon: Addon) => {
        setSelectedAddons(prev => {
            const exists = prev.find(a => a.id === addon.id);
            if (exists) {
                return prev.filter(a => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    };

    const handleBookNow = () => {
        updateBooking({
            service: {
                id: service.id,
                name: service.name,
                image: service.image,
                price: service.price,
                rating: service.rating,
                reviews: service.reviews,
                duration: service.duration,
                category: service.category,
            },
            addons: selectedAddons,
        });

        router.push('/(app)/book/package');
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image with Overlay */}
                <ImageBackground
                    source={{ uri: service.image }}
                    style={styles.heroImage}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(14,18,26,0.3)', 'rgba(14,18,26,0.95)']}
                        style={styles.heroGradient}
                    >
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </ImageBackground>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>{service.name}</Text>
                    <Text style={styles.description}>{service.description}</Text>

                    {/* Key Info Row */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Price</Text>
                            <Text style={styles.infoValue}>₹{service.price}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Duration</Text>
                            <Text style={styles.infoValue}>{service.duration}</Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Rating</Text>
                            <Text style={styles.infoValue}>⭐ {service.rating}</Text>
                        </View>
                    </View>

                    {/* Provider Blind Badge */}
                    <View style={styles.badgeContainer}>
                        <ProviderBlindBadge message="Best provider assigned instantly" />
                    </View>

                    {/* What's Included */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What's Included</Text>
                        {service.included.map((item, index) => (
                            <View key={index} style={styles.bulletItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Add-ons */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Add-ons (Optional)</Text>
                        <View style={styles.addonsContainer}>
                            {service.addons.map((addon) => {
                                const isSelected = selectedAddons.some(a => a.id === addon.id);
                                return (
                                    <TouchableOpacity
                                        key={addon.id}
                                        style={[
                                            styles.addonChip,
                                            isSelected && styles.addonChipSelected,
                                        ]}
                                        onPress={() => toggleAddon(addon)}
                                    >
                                        <Text
                                            style={[
                                                styles.addonChipText,
                                                isSelected && styles.addonChipTextSelected,
                                            ]}
                                        >
                                            {addon.name}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.addonChipPrice,
                                                isSelected && styles.addonChipPriceSelected,
                                            ]}
                                        >
                                            +₹{addon.price}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Floating CTA */}
            <View style={styles.floatingCtaContainer}>
                <FloatingCta
                    designVariant="client"
                    onPress={handleBookNow}
                    icon={<Text style={styles.ctaIcon}>→</Text>}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    heroImage: {
        width: width,
        height: 300,
    },
    heroGradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 8,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
    },
    description: {
        fontSize: 16,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        padding: 16,
        marginBottom: 20,
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: CLIENT_V2_TOKENS.colors.textTertiary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    infoDivider: {
        width: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        marginHorizontal: 8,
    },
    badgeContainer: {
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 12,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 16,
        color: CLIENT_V2_TOKENS.colors.gradientStart,
        marginRight: 8,
        fontWeight: '700',
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        lineHeight: 20,
    },
    addonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    addonChip: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 6,
        borderWidth: 2,
        borderColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    addonChipSelected: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        borderColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    addonChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 2,
    },
    addonChipTextSelected: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    addonChipPrice: {
        fontSize: 12,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    addonChipPriceSelected: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    floatingCtaContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    ctaIcon: {
        fontSize: 24,
        color: '#FFFFFF',
    },
});
