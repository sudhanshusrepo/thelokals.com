import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, Platform, StatusBar, TouchableOpacity } from 'react-native'; // Import StatusBar from react-native instead
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@thelocals/platform-core';
import { useNavigation } from '@react-navigation/native';
import { useProviderDashboardData } from '../../hooks/useProviderDashboardData';
import { HeroCard } from './components/HeroCard';
import { QuickStats } from './components/QuickStats';
import { StatusToggle } from './components/StatusToggle';
import { Bell } from 'lucide-react-native';
import { IdentityBanner } from '../identity/components/IdentityBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { History } from 'lucide-react-native';

export const DashboardScreen = () => {
    const { user, profile } = useAuth();
    const { stats, loading, refresh } = useProviderDashboardData(user?.id);

    // Derive display name securely
    const displayName = (profile as any)?.name || user?.email?.split('@')[0] || 'Partner';
    const navigation = useNavigation<any>(); // Simple typing for now

    // ...

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-5 pt-12 pb-4 flex-row justify-between items-center shadow-sm">
                <View>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">Welcome back,</Text>
                    <Text className="text-2xl font-bold text-gray-900">{displayName}</Text>
                </View>
                <TouchableOpacity
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center relative"
                    onPress={() => navigation.navigate("Jobs", { screen: "Notifications" })}
                >
                    <Bell size={20} color="#374151" />
                    <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 24, paddingTop: Platform.OS === 'android' ? 16 : 0 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#2563EB']} />
                }
            >


                {/* Status Toggle (moved from header) */}
                <View className="mt-4 mb-6">
                    <StatusToggle />
                </View>

                {/* Identity Verification Banner */}
                {!(profile as any)?.is_verified && (
                    <View className="mb-6">
                        <IdentityBanner />
                    </View>
                )}

                {/* Hero Card */}
                <View className="mb-6">
                    <HeroCard
                        monthlyEarnings={stats.monthlyEarnings}
                        percentageChange={12} // Hardcoded trend for now (mock)
                    />
                </View>

                {/* Quick Stats */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-3">Overview</Text>
                    <QuickStats
                        activeJobs={stats.activeJobs}
                        completedToday={stats.completedToday}
                        rating={stats.rating}
                    />
                </View>



                {/* Recent Activity / Empty State */}
                <View>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">Recent Activity</Text>
                        <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                    </View>

                    {/* Placeholder for list */}
                    <View className="bg-gray-50 rounded-xl border border-gray-100 border-dashed py-6">
                        <EmptyState
                            icon={History}
                            title="No recent activity"
                            description="New jobs will appear here"
                        />
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};
