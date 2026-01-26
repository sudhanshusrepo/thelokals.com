import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@thelocals/platform-core';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StatusToggle } from '../dashboard/components/StatusToggle';
import {
    User,
    CreditCard,
    HelpCircle,
    LogOut,
    ChevronRight,
    Settings,
    FileText,
    Shield,
    Calendar
} from 'lucide-react-native';

export const ProfileScreen = () => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const navigation = useNavigation<any>();

    // Derived Data
    const displayName = (profile as any)?.name || user?.email?.split('@')[0] || 'Provider';
    const avatarUrl = (profile as any)?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}`;
    const category = (profile as any)?.category || 'General Service';
    const rating = (profile as any)?.rating || 5.0;

    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [])
    );

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (e) {
                            Alert.alert("Error", "Failed to logout");
                        }
                    }
                }
            ]
        );
    };

    const MenuItem = ({ icon: Icon, label, onPress, destructive = false }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center py-4 border-b border-gray-100"
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${destructive ? 'bg-red-50' : 'bg-gray-50'}`}>
                <Icon size={20} color={destructive ? '#EF4444' : '#4B5563'} />
            </View>
            <Text className={`flex-1 text-base font-medium ${destructive ? 'text-red-600' : 'text-gray-900'}`}>
                {label}
            </Text>
            {!destructive && <ChevronRight size={20} color="#9CA3AF" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Profile Section */}
                <View className="items-center pt-8 pb-6 px-4 bg-white border-b border-gray-100">
                    <View className="relative mb-4">
                        <Image
                            source={{ uri: avatarUrl }}
                            className="w-24 h-24 rounded-full bg-gray-200"
                        />
                        <View className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-100 shadow-sm">
                            <View className="bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                        </View>
                    </View>

                    <Text className="text-2xl font-bold text-gray-900 mb-1">{displayName}</Text>
                    <Text className="text-gray-500 font-medium mb-4">{category} • {rating} ★</Text>

                    <StatusToggle />
                </View>

                {/* Quick Stats Row */}
                <View className="flex-row py-6 border-b border-gray-100">
                    <View className="flex-1 items-center border-r border-gray-100">
                        <Text className="text-gray-400 text-xs font-semibold uppercase mb-1">Earnings (Mo)</Text>
                        <Text className="text-xl font-bold text-gray-900">$0</Text>
                    </View>
                    <View className="flex-1 items-center border-r border-gray-100">
                        <Text className="text-gray-400 text-xs font-semibold uppercase mb-1">Jobs</Text>
                        <Text className="text-xl font-bold text-gray-900">0</Text>
                    </View>
                    <View className="flex-1 items-center">
                        <Text className="text-gray-400 text-xs font-semibold uppercase mb-1">Rating</Text>
                        <Text className="text-xl font-bold text-gray-900">{rating}</Text>
                    </View>
                </View>

                {/* Menu */}
                <View className="px-5 mt-4">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Account</Text>
                    <MenuItem icon={User} label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
                    <MenuItem icon={Calendar} label="Manage Schedule" onPress={() => navigation.navigate('Schedule')} />
                    <MenuItem icon={CreditCard} label="Bank & Payouts" onPress={() => Alert.alert("Coming Soon", "Bank & Payouts integration is in progress.")} />
                    <MenuItem icon={FileText} label="Documents & Verification" onPress={() => Alert.alert("Coming Soon", "Document management is coming in the next update.")} />

                    <Text className="text-gray-400 text-xs font-bold uppercase mb-2 mt-6">App</Text>
                    <MenuItem icon={Settings} label="Settings" onPress={() => Alert.alert("Settings", "App settings are default for now.")} />
                    <MenuItem icon={HelpCircle} label="Help & Support" onPress={() => Alert.alert("Support", "Please contact support@thelokals.com")} />
                    <MenuItem icon={Shield} label="Privacy Policy" onPress={() => Alert.alert("Privacy", "Your data is secure with The Locals.")} />

                    <View className="mt-6">
                        <MenuItem icon={LogOut} label="Logout" destructive onPress={handleLogout} />
                    </View>
                </View>

                <View className="items-center mt-8 mb-4">
                    <Text className="text-gray-300 text-xs">Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
