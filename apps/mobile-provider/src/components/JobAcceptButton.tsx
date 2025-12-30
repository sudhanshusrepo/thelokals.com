import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export const JobAcceptButton = ({ onAccept }: { onAccept: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handleAccept = async () => {
        // Heavy haptic success
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Pulse animation
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => onAccept()); // Call callback after animation starts to feel responsive
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPress={handleAccept}
                style={styles.button}
                accessible={true}
                accessibilityLabel="Accept Job"
                accessibilityRole="button"
                accessibilityHint="Double tap to accept this job offer"
            >
                <Text style={styles.text}>Accept Job</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#8AE98D',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#8AE98D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12
    },
    text: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white'
    }
});
