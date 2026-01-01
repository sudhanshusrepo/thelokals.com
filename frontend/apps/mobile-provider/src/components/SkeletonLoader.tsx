import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SkeletonLoader = ({ style, height = 120 }: { style?: any, height?: number }) => {
    const shimmer = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmer, {
                toValue: 2,
                duration: 1200,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmer.interpolate({
        inputRange: [-1, 1, 2],
        outputRange: [-height * 2, height, height * 2],
    });

    return (
        <View style={[{ height, backgroundColor: '#F0F0F0', overflow: 'hidden', borderRadius: 20 }, style]}>
            <Animated.View
                style={[
                    {
                        flex: 1,
                        backgroundColor: 'transparent',
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#F7C846', '#8AE98D', '#F7C846']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
};
