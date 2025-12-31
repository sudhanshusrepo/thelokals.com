import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import Animated, { FadeIn, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
    const router = useRouter();
    const opacity = useSharedValue(0);

    useEffect(() => {
        // Fade in animation
        opacity.value = withTiming(1, { duration: 1000 });

        // Navigate after 3 seconds
        const timer = setTimeout(() => {
            router.replace('/(app)/home');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={[CLIENT_V2_TOKENS.colors.gradientStart, CLIENT_V2_TOKENS.colors.gradientEnd]}
            style={styles.container}
        >
            <Animated.View entering={FadeIn.duration(1000)}>
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
    },
});
