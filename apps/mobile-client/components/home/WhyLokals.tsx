import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const features = [
    {
        icon: 'shield',
        title: 'Verified Pros',
        desc: 'Background checked & trained professionals.'
    },
    {
        icon: 'tag',
        title: 'Fair Pricing',
        desc: 'Upfront pricing, no hidden costs.'
    },
    {
        icon: 'clock-o',
        title: 'On Time',
        desc: 'Punctual service delivery guaranteed.'
    },
    {
        icon: 'headphones',
        title: '24/7 Support',
        desc: 'Dedicated support for all your needs.'
    }
];

export const WhyLokals = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Why Choose Lokals?</Text>
            <View style={styles.grid}>
                {features.map((feature, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.iconBox}>
                            <FontAwesome name={feature.icon as any} size={20} color={Colors.teal.DEFAULT} />
                        </View>
                        <Text style={styles.cardTitle}>{feature.title}</Text>
                        <Text style={styles.cardDesc}>{feature.desc}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.slate[900],
        marginBottom: 20,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%', // Approx half with spacing
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        // Premium Card Style
        borderWidth: 1,
        borderColor: Colors.slate[100],
        shadowColor: Colors.teal.DEFAULT,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.teal[50], // Soft teal background
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.teal[100],
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.slate[900],
        marginBottom: 6,
    },
    cardDesc: {
        fontSize: 13,
        color: Colors.slate[500],
        lineHeight: 18,
    }
});
