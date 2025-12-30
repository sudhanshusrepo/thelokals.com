import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DigilockerIntroScreen from '../screens/onboarding/DigilockerIntro';
import DigilockerAuthScreen from '../screens/onboarding/DigilockerAuth';
import RegistrationFormScreen from '../screens/onboarding/RegistrationForm';
import PendingApprovalScreen from '../screens/onboarding/PendingApproval';
import ApprovedScreen from '../screens/onboarding/Approved';

export type OnboardingStackParamList = {
    DigilockerIntro: undefined;
    DigilockerAuth: undefined;
    RegistrationForm: undefined;
    PendingApproval: undefined;
    Approved: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F0F0F0' }
            }}
        >
            <Stack.Screen name="DigilockerIntro" component={DigilockerIntroScreen} />
            <Stack.Screen name="DigilockerAuth" component={DigilockerAuthScreen} />
            <Stack.Screen name="RegistrationForm" component={RegistrationFormScreen} />
            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
            <Stack.Screen name="Approved" component={ApprovedScreen} />
        </Stack.Navigator>
    );
};
