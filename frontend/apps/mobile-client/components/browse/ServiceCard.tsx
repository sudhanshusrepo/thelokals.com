import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

interface ServiceCardProps {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    priceStart?: string;
    isOnline: boolean;
    onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
    name, image, rating, reviews, priceStart, isOnline, onPress
}) => {
    if (isOnline) {
        // Online Layout (Lightweight, horizontal or simpler)
        return (
            <TouchableOpacity style={styles.onlineCard} onPress={onPress}>
                <View style={styles.iconContainer}>
                    {/* Placeholder icon logic based on name or passed prop would be better */}
                    <FontAwesome name="check-circle" size={24} color={Colors.teal.DEFAULT} />
                </View>
                <View style={styles.onlineContent}>
                    <Text style={styles.onlineName}>{name}</Text>
                    <Text style={styles.onlinePrice}>Starts at {priceStart}</Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={Colors.slate[300]} />
            </TouchableOpacity>
        );
    }

    // Offline Layout (Visual, grid card)
    return (
        <TouchableOpacity style={styles.offlineCard} onPress={onPress} activeOpacity={0.9}>
            <Image source={{ uri: image }} style={styles.cardImage} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={2}>{name}</Text>
                <View style={styles.ratingRow}>
                    <FontAwesome name="star" size={12} color={Colors.amber.DEFAULT} />
                    <Text style={styles.ratingText}>{rating} ({reviews})</Text>
                </View>
                {priceStart && (
                    <Text style={styles.priceTag}>from {priceStart}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Online Styles
    onlineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.slate[200],
        shadowColor: Colors.teal.DEFAULT,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.teal[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    onlineContent: {
        flex: 1,
    },
    onlineName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.slate[800],
    },
    onlinePrice: {
        fontSize: 12,
        color: Colors.slate[500],
    },

    // Offline Styles
    offlineCard: {
        width: cardWidth,
        height: cardWidth * 1.3,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: Colors.slate[200],
        overflow: 'hidden',
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    priceTag: {
        color: Colors.teal.light,
        fontSize: 12,
        fontWeight: '700',
    },
});
