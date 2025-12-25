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
        backgroundColor: Colors.slate[50],
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.slate[100],
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.teal[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.slate[800],
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 12,
        color: Colors.slate[500],
        lineHeight: 18,
    }
});
