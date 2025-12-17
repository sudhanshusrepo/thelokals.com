import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');
const STEP_WIDTH = width * 0.8;
const SPACING = (width - STEP_WIDTH) / 2;

export const HowItWorks = () => {
    const [scrollX] = useState(new Animated.Value(0));

    const steps = [
        {
            icon: "search",
            title: "Search",
            description: "Find the service you need from our wide range of categories."
        },
        {
            icon: "calendar",
            title: "Book",
            description: "Choose a professional and schedule a time that works for you."
        },
        {
            icon: "star",
            title: "Relax",
            description: "Sit back while our verified experts take care of everything."
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>How It Works</Text>
                <Text style={styles.subtitle}>Simple steps to get your life sorted.</Text>
            </View>

            <Animated.ScrollView
                horizontal
                snapToInterval={STEP_WIDTH + 20} // 20 is margin
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {steps.map((step, index) => {
                    const inputRange = [
                        (index - 1) * STEP_WIDTH,
                        index * STEP_WIDTH,
                        (index + 1) * STEP_WIDTH,
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.9, 1, 0.9],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.6, 1, 0.6],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.stepCard,
                                { transform: [{ scale }], opacity }
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <FontAwesome name={step.icon as any} size={32} color={Colors.teal[600]} />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{index + 1}</Text>
                                </View>
                            </View>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepDescription}>{step.description}</Text>
                        </Animated.View>
                    );
                })}
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        backgroundColor: '#F8FAFC', // slate-50
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.slate[800],
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.slate[600],
    },
    scrollContent: {
        paddingHorizontal: SPACING - 10, // Adjust for margin
    },
    stepCard: {
        width: STEP_WIDTH,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.slate[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: Colors.teal[100],
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.teal[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.slate[800],
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        color: Colors.slate[600],
        textAlign: 'center',
        lineHeight: 20,
    },
});
