import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { TabNavigator, MainTabParamList } from './TabNavigator';
import { JobDetailV2Screen } from '../screens/JobDetailV2';
import { OnboardingNavigator } from './OnboardingNavigator';
import { EditProfileScreen } from '../screens/EditProfile';
import { BankDetailsScreen } from '../screens/BankDetails';

export type RootStackParamList = {
    Onboarding: undefined;
    Main: NavigatorScreenParams<MainTabParamList>;
    JobDetail: { jobId: string };
    EditProfile: undefined;
    BankDetails: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Onboarding" // Start with Onboarding for Demo
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#F8FAFC' }
                }}
            >
                <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="JobDetail" component={JobDetailV2Screen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
