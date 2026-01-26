import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    image?: any; // require() source
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    image
}) => {
    return (
        <View className="flex-1 items-center justify-center p-8">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
                {image ? (
                    <Image source={image} className="w-12 h-12" resizeMode="contain" />
                ) : Icon ? (
                    <Icon size={40} color="#D1D5DB" />
                ) : null}
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-2 text-center">{title}</Text>

            {description && (
                <Text className="text-center text-gray-500 leading-5 mb-6">
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className="bg-blue-600 px-6 py-3 rounded-xl shadow-sm"
                >
                    <Text className="text-white font-bold">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
