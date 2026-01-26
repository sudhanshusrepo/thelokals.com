import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { ProviderNavigator } from './ProviderNavigator';
import { DigiLockerIntroScreen } from '../features/identity/screens/DigiLockerIntroScreen';
import { DigiLockerAuthScreen } from '../features/identity/screens/DigiLockerAuthScreen';
import { useAuth } from '@thelocals/platform-core';
import { View, ActivityIndicator } from 'react-native';
import { linking } from './linking';
import { usePushNotifications } from '../hooks/usePushNotifications';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    const { session, loading } = useAuth(); // Shared hook works!
    usePushNotifications(); // Initialize push listener

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <NavigationContainer linking={linking as any}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <>
                        <Stack.Screen name="Main" component={ProviderNavigator} />
                        <Stack.Screen name="DigiLockerIntro" component={DigiLockerIntroScreen} />
                        <Stack.Screen name="DigiLockerAuth" component={DigiLockerAuthScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="OTP" component={OTPVerificationScreen} options={{ headerShown: true, title: '' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
