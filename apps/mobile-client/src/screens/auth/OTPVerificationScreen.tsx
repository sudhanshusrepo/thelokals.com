import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

export const OTPVerificationScreen = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const route = useRoute<any>();
    const { phone } = route.params || {};

    const verifyOtp = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;
            // success handling happens automatically via AuthProvider listening to state change
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-6 pt-20">
            <Text className="text-2xl font-bold mb-2">Verify Phone</Text>
            <Text className="text-gray-600 mb-8">
                Enter the code sent to {phone}
            </Text>

            <TextInput
                className="w-full bg-gray-100 p-4 rounded-lg mb-6 text-xl text-center tracking-widest"
                placeholder="000000"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                maxLength={6}
                autoFocus
            />

            <TouchableOpacity
                className="bg-blue-600 p-4 rounded-lg items-center"
                onPress={verifyOtp}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-semibold text-lg">Verify Code</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
