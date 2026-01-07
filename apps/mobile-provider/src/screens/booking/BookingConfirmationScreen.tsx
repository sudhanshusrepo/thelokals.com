import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Calendar, MapPin } from 'lucide-react-native';

export const BookingConfirmationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { bookingId } = route.params || {};

    return (
        <View className="flex-1 bg-white items-center p-6 justify-center">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                <Check size={48} color="#16A34A" {...({} as any)} />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Booking Request Sent!</Text>
            <Text className="text-gray-500 text-center mb-8 px-4">
                We've sent your request to the provider. You will be notified once they accept.
            </Text>

            <View className="w-full bg-gray-50 p-6 rounded-2xl mb-8">
                <View className="flex-row items-center mb-4">
                    <Calendar size={20} color="#6B7280" {...({} as any)} />
                    <Text className="ml-3 text-gray-700 font-semibold">Pending Confirmation</Text>
                </View>
                <View className="flex-row items-center">
                    <MapPin size={20} color="#6B7280" {...({} as any)} />
                    <Text className="ml-3 text-gray-700 font-semibold">New York, USA</Text>
                </View>
            </View>

            <TouchableOpacity
                className="w-full bg-blue-600 p-4 rounded-xl items-center"
                onPress={() => navigation.navigate('HomeIndex')}
            >
                <Text className="text-white font-bold text-lg">Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-4 p-4"
                onPress={() => navigation.navigate('Bookings')}
            >
                <Text className="text-blue-600 font-semibold">View My Bookings</Text>
            </TouchableOpacity>
        </View>
    );
};
