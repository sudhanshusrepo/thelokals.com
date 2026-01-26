import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, providerService } from '@thelocals/platform-core';
import { CheckCircle } from 'lucide-react-native';

export const DigiLockerAuthScreen = () => {
    const navigation = useNavigation<any>();
    const { user, refreshProfile } = useAuth();
    const [step, setStep] = useState<'CONNECTING' | 'FETCHING' | 'VERIFYING' | 'SUCCESS'>('CONNECTING');

    useEffect(() => {
        if (!user?.id) return;

        const mockAuthFlow = async () => {
            try {
                // Step 1: Connecting
                await new Promise(r => setTimeout(r, 1500));
                setStep('FETCHING');

                // Step 2: Fetching Docs
                await new Promise(r => setTimeout(r, 2000));
                setStep('VERIFYING');

                // Step 3: Verifying (DB Update)
                await providerService.updateProfile(user.id, {
                    isVerified: true,
                    is_verified: true
                } as any);

                await new Promise(r => setTimeout(r, 1500));
                setStep('SUCCESS');

                await refreshProfile();

                // Redirect after success
                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Profile' }], // Navigate back to profile or main tabs
                    });
                }, 2000);

            } catch (error) {
                console.error(error);
                navigation.goBack();
            }
        };

        mockAuthFlow();
    }, [user]);

    return (
        <View className="flex-1 bg-white items-center justify-center p-8">
            {step === 'SUCCESS' ? (
                <View className="items-center animate-bounce">
                    <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                        <CheckCircle size={48} color="#059669" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mb-2">Verified!</Text>
                    <Text className="text-gray-500">Redirecting to profile...</Text>
                </View>
            ) : (
                <View className="items-center">
                    <ActivityIndicator size="large" color="#2563EB" className="mb-8 transform scale-150" />

                    <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                        {step === 'CONNECTING' && "Connecting to DigiLocker..."}
                        {step === 'FETCHING' && "Fetching Aadhaar details..."}
                        {step === 'VERIFYING' && "Verifying identity..."}
                    </Text>
                    <Text className="text-gray-500 text-sm">Please do not close this screen.</Text>
                </View>
            )}

            <View className="absolute bottom-10 flex-row items-center gap-2 opacity-50">
                <Text className="font-bold text-gray-400">DigiLocker</Text>
                <View className="bg-gray-200 px-1 rounded">
                    <Text className="text-[10px] text-gray-500 font-bold">SECURE</Text>
                </View>
            </View>
        </View>
    );
};
