import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ServiceDetailScreen } from '../screens/booking/ServiceDetailScreen';
import { BookingFormScreen } from '../screens/booking/BookingFormScreen';
import { BookingConfirmationScreen } from '../screens/booking/BookingConfirmationScreen';
import { PaymentScreen } from '../screens/booking/PaymentScreen';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@thelocals/platform-core';
import { Home, Search, Calendar, User } from 'lucide-react-native';

import { BookingsScreen } from '../screens/booking/BookingsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Home Stack Navigator
const HomeNavigator = () => {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: true }}>
            <HomeStack.Screen name="HomeIndex" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Service Details' }} />
            <HomeStack.Screen name="BookingForm" component={BookingFormScreen} options={{ title: 'Book Service' }} />
            <HomeStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
            <HomeStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ headerShown: false }} />
        </HomeStack.Navigator>
    );
};

// Placeholder screens
const SearchScreen = () => <View className="flex-1 bg-white" />;

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} {...({} as any)} />
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Search size={size} color={color} {...({} as any)} />
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={BookingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} {...({} as any)} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} {...({} as any)} />
                }}
            />
        </Tab.Navigator>
    );
};
