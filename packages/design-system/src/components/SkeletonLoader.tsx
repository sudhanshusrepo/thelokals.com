import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
    width: number | string;
    height: number;
    style?: ViewStyle;
    borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width,
    height,
    style,
    borderRadius = 8,
}) => {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmer, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmer]);

    const translateX = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    return (
        <View
            style={[
                {
                    width,
                    height,
                    backgroundColor: '#E0E0E0',
                    borderRadius,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            <Animated.View
                style={{
                    width: '100%',
                    height: '100%',
                    transform: [{ translateX }],
                }}
            >
                <LinearGradient
                    colors={['#E0E0E0', '#F0F0F0', '#E0E0E0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
};

// Skeleton variants for common use cases
export const SkeletonServiceCard = () => (
    <View style={styles.serviceCardSkeleton}>
        <SkeletonLoader width="100%" height={120} borderRadius={8} />
        <SkeletonLoader width="80%" height={16} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
    </View>
);

export const SkeletonBookingCard = () => (
    <View style={styles.bookingCardSkeleton}>
        <SkeletonLoader width={60} height={60} borderRadius={8} />
        <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonLoader width="70%" height={16} borderRadius={4} />
            <SkeletonLoader width="50%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
    </View>
);

const styles = StyleSheet.create({
    serviceCardSkeleton: {
        width: 160,
        padding: 8,
    },
    bookingCardSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
    },
});
