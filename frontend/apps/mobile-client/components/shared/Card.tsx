import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { motion } from '@/theme/motion';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: 'default' | 'primary' | 'elevated';
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
    children,
    onPress,
    variant = 'default',
    style,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            damping: motion.springConfig.damping,
            mass: motion.springConfig.mass,
            stiffness: motion.springConfig.stiffness,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            damping: motion.springConfig.damping,
            mass: motion.springConfig.mass,
            stiffness: motion.springConfig.stiffness,
            useNativeDriver: true,
        }).start();
    };

    const cardStyle = [
        styles.card,
        variant === 'primary' && styles.cardPrimary,
        variant === 'elevated' && styles.cardElevated,
        style,
    ];

    if (onPress) {
        return (
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View style={[cardStyle, { transform: [{ scale: scaleAnim }] }]}>
                    {children}
                </Animated.View>
            </Pressable>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: spacing.lg,
        shadowColor: colors.shadowMedium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPrimary: {
        borderTopWidth: 3,
        borderTopColor: colors.primary,
    },
    cardElevated: {
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
});
