import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldCheck, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export const IdentityBanner = () => {
    const navigation = useNavigation<any>();

    return (
        <LinearGradient
            colors={['#EFF6FF', '#EEF2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="p-4 rounded-xl flex-row items-center justify-between mb-6 border border-blue-100"
        >
            <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                    <ShieldCheck size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-gray-900">Verify your Identity</Text>
                    <Text className="text-xs text-gray-600 mt-0.5">Get the "Verified" badge and 3x more jobs.</Text>
                </View>
            </View>

            <TouchableOpacity
                className="bg-blue-600 px-3 py-2 rounded-lg flex-row items-center gap-1"
                onPress={() => navigation.navigate('DigiLockerIntro')}
            >
                <Text className="text-white text-xs font-bold">Verify</Text>
                <ChevronRight size={14} color="white" />
            </TouchableOpacity>
        </LinearGradient>
    );
};
