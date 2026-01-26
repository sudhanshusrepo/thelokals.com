import React from 'react';
import { View, Text } from 'react-native';
import { Briefcase, CheckCircle, Star } from 'lucide-react-native';

interface QuickStatsProps {
    activeJobs: number;
    completedToday: number;
    rating: number;
}

export const QuickStats = ({ activeJobs, completedToday, rating }: QuickStatsProps) => {
    const stats = [
        { label: 'Active Jobs', value: activeJobs, color: 'text-blue-600', bg: 'bg-blue-50', icon: Briefcase, iconColor: '#2563EB' },
        { label: 'Completed', value: completedToday, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, iconColor: '#16A34A' },
        { label: 'Rating', value: rating, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Star, iconColor: '#CA8A04' },
    ];

    return (
        <View className="flex-row gap-3">
            {stats.map((stat, i) => (
                <View key={i} className="flex-1 bg-white p-3 rounded-xl border border-gray-100 items-center justify-center shadow-sm">
                    <View className={`p-2 rounded-full mb-2 ${stat.bg}`}>
                        <stat.icon size={18} color={stat.iconColor} />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">{stat.value}</Text>
                    <Text className="text-xs text-gray-500 font-medium text-center">{stat.label}</Text>
                </View>
            ))}
        </View>
    );
};
