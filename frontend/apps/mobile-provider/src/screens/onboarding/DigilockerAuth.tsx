import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type AuthNavProp = StackNavigationProp<OnboardingStackParamList, 'DigilockerAuth'>;

export default function DigilockerAuthScreen() {
    const navigation = useNavigation<AuthNavProp>();

    useEffect(() => {
        // Mock Auth Delay
        const timer = setTimeout(() => {
            navigation.replace('RegistrationForm');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' }}>
            <ActivityIndicator size="large" color="#FC574E" />
            <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Connecting to DigiLocker...</Text>
        </View>
    );
}
