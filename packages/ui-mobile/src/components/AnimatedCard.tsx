import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';

interface AnimatedCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    disabled?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    onPress,
    style,
    disabled = false,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[style, { transform: [{ scale }] }]}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                activeOpacity={1}
                disabled={disabled}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
};
