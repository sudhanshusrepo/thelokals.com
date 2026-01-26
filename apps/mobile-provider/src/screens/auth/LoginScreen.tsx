import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { logger } from '@thelocals/platform-core';

export const LoginScreen = () => {
    const [phone, setPhone] = useState('+91');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const sendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: phone,
            });

            if (error) throw error;

            navigation.navigate('OTP', { phone });
        } catch (error: any) {
            Alert.alert('Error', error.message);
            logger.error('Login Error', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 justify-center items-center p-6">
                <Text className="text-2xl font-bold mb-8 text-black">Lokals Partner Login</Text>

                <View className="w-full max-w-sm">
                    <Text className="text-gray-600 mb-2">Phone Number</Text>
                    <TextInput
                        className="w-full bg-gray-100 p-4 rounded-lg mb-6 text-lg"
                        placeholder="+91 99999 99999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <TouchableOpacity
                        className="bg-blue-600 p-4 rounded-lg items-center"
                        onPress={sendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-semibold text-lg">Get OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
