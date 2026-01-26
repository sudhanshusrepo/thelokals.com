import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, ArrowRight } from 'lucide-react-native';

interface HeroCardProps {
    monthlyEarnings: number;
    percentageChange: number;
    onPressAnalytics?: () => void;
}

export const HeroCard = ({ monthlyEarnings, percentageChange, onPressAnalytics }: HeroCardProps) => {
    return (
        <View className="w-full bg-blue-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            {/* Content */}
            <View className="z-10">
                <Text className="text-blue-100 font-medium text-sm mb-1">December earnings</Text>
                <Text className="text-white text-4xl font-bold mb-4">₹{monthlyEarnings.toLocaleString()}</Text>

                <View className="flex-row items-center gap-2 mb-6">
                    <View className="bg-white/20 p-1 rounded-full">
                        <TrendingUp size={14} color="white" />
                    </View>
                    <Text className="text-white font-semibold text-sm">+{percentageChange}% from last month</Text>
                </View>

                {onPressAnalytics && (
                    <TouchableOpacity
                        onPress={onPressAnalytics}
                        className="flex-row items-center self-start bg-white/20 px-4 py-2 rounded-full border border-white/10"
                    >
                        <Text className="text-white font-bold text-xs mr-2">View detailed analytics</Text>
                        <ArrowRight size={14} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Decorative BG Circles */}
            <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute top-4 right-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl" />
        </View>
    );
};
