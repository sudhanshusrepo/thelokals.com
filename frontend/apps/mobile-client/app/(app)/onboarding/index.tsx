import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { onboardingSlides } from './slides';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < onboardingSlides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.replace('/(app)/home');
        }
    };

    const handleSkip = () => {
        router.replace('/(app)/home');
    };

    return (
        <View style={styles.container}>
            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={onboardingSlides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { width }]}>
                        <Image source={item.image} style={styles.image} resizeMode="contain" />
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}
            />

            {/* Navigation Dots */}
            <View style={styles.dotsContainer}>
                {onboardingSlides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            {
                                width: currentIndex === index ? 24 : 8,
                                backgroundColor: currentIndex === index
                                    ? CLIENT_V2_TOKENS.colors.gradientStart
                                    : '#DDD',
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Get Started / Next Button */}
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                    {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        color: CLIENT_V2_TOKENS.colors.textTertiary,
        fontWeight: '600',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    image: {
        width: 250,
        height: 250,
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
    },
    description: {
        fontSize: 16,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        transition: 'all 0.3s',
    },
    button: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
        marginHorizontal: 20,
        marginBottom: 40,
        padding: 16,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
