import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { CLIENT_V2_TOKENS } from '../tokens/client-v2';

export interface ServiceCardProps {
    serviceImage: ImageSourcePropType | string;
    title: string;
    price: string;
    rating: number;
    isBestMatch?: boolean;
    style?: ViewStyle;
}

/**
 * ServiceCard Component - Provider-Blind Design
 * 160x220px card showing service info WITHOUT provider details
 * Key feature: "Best Match" chip instead of provider info
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
    serviceImage,
    title,
    price,
    rating,
    isBestMatch = false,
    style
}) => {
    return (
        <View style={[styles.card, style]}>
            {/* Service Image */}
            <View style={styles.imageContainer}>
                {typeof serviceImage === 'string' ? (
                    <Image
                        source={{ uri: serviceImage }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <Image
                        source={serviceImage}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
            </View>

            {/* Service Info */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.price}>{price}</Text>

                    <View style={styles.ratingRow}>
                        <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
                        {isBestMatch && (
                            <View style={styles.bestMatchChip}>
                                <Text style={styles.bestMatchText}>Best Match</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CLIENT_V2_TOKENS.dimensions.serviceCard.width,
        height: CLIENT_V2_TOKENS.dimensions.serviceCard.height,
        borderRadius: CLIENT_V2_TOKENS.radius.card,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgSurface,
        overflow: 'hidden',
        ...CLIENT_V2_TOKENS.shadows.card,
    },
    imageContainer: {
        width: '100%',
        height: 120,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        padding: CLIENT_V2_TOKENS.spacing.sm,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: CLIENT_V2_TOKENS.typography.label.fontSize,
        fontWeight: CLIENT_V2_TOKENS.typography.label.fontWeight,
        color: CLIENT_V2_TOKENS.typography.label.color,
        marginBottom: CLIENT_V2_TOKENS.spacing.xs,
    },
    footer: {
        gap: CLIENT_V2_TOKENS.spacing.xs,
    },
    price: {
        fontSize: CLIENT_V2_TOKENS.typography.body.fontSize,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: CLIENT_V2_TOKENS.spacing.xs,
    },
    rating: {
        fontSize: CLIENT_V2_TOKENS.typography.caption.fontSize,
        fontWeight: CLIENT_V2_TOKENS.typography.caption.fontWeight,
        color: CLIENT_V2_TOKENS.colors.accentWarning,
    },
    bestMatchChip: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentSuccess,
        paddingHorizontal: CLIENT_V2_TOKENS.spacing.xs,
        paddingVertical: 2,
        borderRadius: CLIENT_V2_TOKENS.radius.pill,
    },
    bestMatchText: {
        fontSize: 10,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
});
