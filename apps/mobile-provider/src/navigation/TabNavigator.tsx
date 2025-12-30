import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeV2Screen } from '../screens/HomeV2';
import { EarningsV2Screen } from '../screens/EarningsV2';
import { ProfileV2Screen } from '../screens/ProfileV2';
import { AvailabilityScreen } from '../screens/Availability';
import { JobsListScreen } from '../screens/JobsList';
import { PROVIDER_V2_TOKENS } from '@lokals/design-system';

export type MainTabParamList = {
    Dashboard: undefined;
    Jobs: undefined;
    Earnings: undefined;
    Availability: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: PROVIDER_V2_TOKENS.colors.primary,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    backgroundColor: '#F0F0F0',
                    borderTopWidth: 0,
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={HomeV2Screen}
                options={{
                    tabBarLabel: 'Home',
                    // icon placeholder
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={JobsListScreen}
                options={{
                    tabBarLabel: 'Jobs',
                }}
            />
            <Tab.Screen
                name="Earnings"
                component={EarningsV2Screen}
                options={{
                    tabBarLabel: 'Earnings',
                }}
            />
            <Tab.Screen
                name="Availability"
                component={AvailabilityScreen}
                options={{
                    tabBarLabel: 'Availability',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileV2Screen}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
};
