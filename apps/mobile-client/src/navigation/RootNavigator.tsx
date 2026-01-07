import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '@thelocals/platform-core';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

import { linking } from './linking';

export const RootNavigator = () => {
    const { session, loading } = useAuth(); // Shared hook works!

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
                    <Stack.Screen name="Main" component={MainNavigator} />
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
