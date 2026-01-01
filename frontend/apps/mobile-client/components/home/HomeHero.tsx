import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Colors from '@/constants/Colors';
import { useLocation } from '@/contexts/LocationContext';
import { UnicornAnimatedView } from '@/components/UnicornAnimatedView';

const { width } = Dimensions.get('window');

// Placeholder for Unicorn3D - currently using the existing component or image as background
export const HomeHero = () => {
    const { location } = useLocation();

    return (
        <View style={styles.container}>
            {/* Background - Reusing existing UnicornAnimatedView as the "slot" */}
            {/* If UnicornAnimatedView is too dominant, we might overlay a gradient or adjust its style */}
            <View style={styles.backgroundContainer}>
                <UnicornAnimatedView style={styles.backgroundAnimation} />
                <View style={styles.gradientOverlay} />
            </View>

            <View style={styles.contentContainer}>
                {/* Eyebrow / Pill */}
                <View style={styles.pillContainer}>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>get STUFF done! 😎</Text>
                    </View>
                </View>

                {/* Heading */}
                <Text style={styles.heading}>
                    Trusted Local Services,{'\n'}
                    One Tap Away
                </Text>

                {/* Subtext */}
                <Text style={styles.subtext}>
                    Book verified providers for AC repair, cleaning, grooming and more in {location?.city || 'your neighborhood'}.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 350, // Approx 40-50% of screen height
        justifyContent: 'flex-end',
        marginBottom: 20,
        backgroundColor: Colors.slate[900], // Fallback bg
        overflow: 'hidden',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundAnimation: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // Slate-900 with opacity
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 80, // Space for Search Bar which will overlap
        zIndex: 10,
        alignItems: 'center',
    },
    pillContainer: {
        marginBottom: 16,
    },
    pill: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    pillText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    heading: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 40,
    },
    subtext: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 24,
    },
});
