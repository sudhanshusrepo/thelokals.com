import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { PROVIDER_V2_TOKENS } from '../tokens/provider-v2';

export interface ServiceToggleChipProps {
    label: string;
    isActive: boolean;
    onToggle: () => void;
    style?: ViewStyle;
}

export const ServiceToggleChip: React.FC<ServiceToggleChipProps> = ({
    label,
    isActive,
    onToggle,
    style
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                isActive ? styles.activeChip : styles.inactiveChip,
                style
            ]}
            onPress={onToggle}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.text,
                isActive ? styles.activeText : styles.inactiveText
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: PROVIDER_V2_TOKENS.radius.pill,
        borderWidth: 1,
        marginRight: 8,
    },
    inactiveChip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
    },
    activeChip: {
        backgroundColor: 'rgba(247, 200, 70, 0.2)', // Yellowish tint
        borderColor: PROVIDER_V2_TOKENS.colors.gradientStart,
    },
    text: {
        fontSize: PROVIDER_V2_TOKENS.typography.label.fontSize,
        fontWeight: '500',
    },
    inactiveText: {
        color: PROVIDER_V2_TOKENS.typography.label.color,
    },
    activeText: {
        color: '#D4A000', // Dark yellow/text
    },
});
