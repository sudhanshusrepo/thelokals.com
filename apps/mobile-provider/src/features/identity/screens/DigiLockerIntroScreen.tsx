import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ShieldCheck, ChevronLeft, CheckCircle } from 'lucide-react-native';

export const DigiLockerIntroScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Identity Verification</Text>
            </View>

            <View className="flex-1 px-6 items-center justify-center">
                <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-8">
                    <ShieldCheck size={48} color="#2563EB" />
                </View>

                <Text className="text-2xl font-bold text-center text-gray-900 mb-4">
                    Verify with DigiLocker
                </Text>

                <Text className="text-gray-500 text-center mb-8 leading-6">
                    Connect your DigiLocker account to instantly verify your identity (Aadhaar/PAN).
                    Verified providers get <Text className="font-bold text-gray-900">3x more jobs</Text> and higher trust from customers.
                </Text>

                <View className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                    <View className="flex-row items-center gap-3 mb-3">
                        <CheckCircle size={20} color="#059669" />
                        <Text className="text-gray-700 font-medium">Instant Verification</Text>
                    </View>
                    <View className="flex-row items-center gap-3 mb-3">
                        <CheckCircle size={20} color="#059669" />
                        <Text className="text-gray-700 font-medium">Secure & Government Approved</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <CheckCircle size={20} color="#059669" />
                        <Text className="text-gray-700 font-medium">Verified Badge on Profile</Text>
                    </View>
                </View>

                <TouchableOpacity
                    className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-md shadow-blue-200"
                    onPress={() => navigation.navigate('DigiLockerAuth')}
                >
                    <Text className="text-white font-bold text-lg">Connect DigiLocker</Text>
                </TouchableOpacity>

                <Text className="text-xs text-gray-400 mt-6 text-center">
                    By connecting, you agree to share your Aadhaar/PAN details with The Lokals for verification purposes only.
                </Text>
            </View>
        </SafeAreaView>
    );
};
