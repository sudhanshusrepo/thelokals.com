import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { bookingService, useAuth } from '@thelocals/platform-core';

export const BookingFormScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { provider, category, aiMode } = route.params;
    const { user } = useAuth();

    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBooking = async () => {
        if (!notes.trim()) {
            Alert.alert("Requirement", "Please add some notes about what you need.");
            return;
        }

        setLoading(true);
        try {
            if (aiMode) {
                await bookingService.createAIBooking({
                    clientId: user!.id,
                    serviceCategory: category.name,
                    requirements: { notes },
                    aiChecklist: [],
                    estimatedCost: 0,
                    location: { lat: 40.7128, lng: -74.0060 },
                    address: { city: 'New York' },
                    notes: notes
                });
            } else {
                await bookingService.createBooking(
                    provider.id,
                    user!.id,
                    notes,
                    provider.price || 0
                );
            }

            /* 
               In a real app, 'createBooking' would likely be called AFTER payment success, 
               or create a PENDING booking here and update it after payment.
               For this flow, we'll pass the intent to Payment Screen.
            */

            navigation.navigate('Payment', {
                bookingData: { provider, notes },
                amount: provider.price || 40
            });

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create booking");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="p-6">
                <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    {aiMode ? 'AI REQUEST' : 'DIRECT BOOKING'}
                </Text>
                <Text className="text-3xl font-bold mb-2 text-gray-900">
                    {aiMode ? `Find me a ${category.name}` : `Book ${provider.name}`}
                </Text>

                <View className="h-px bg-gray-200 w-full my-6" />

                <Text className="text-gray-700 font-semibold mb-2 text-lg">What do you need done?</Text>
                <TextInput
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl min-h-[150px] text-lg mb-6"
                    placeholder="Describe the job details..."
                    multiline
                    textAlignVertical="top"
                    value={notes}
                    onChangeText={setNotes}
                />

                {!aiMode && (
                    <View className="bg-gray-50 p-4 rounded-xl mb-6">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Hourly Rate</Text>
                            <Text className="font-semibold text-gray-900">${provider.price || 40}/hr</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Est. Duration</Text>
                            <Text className="font-semibold text-gray-900">2 hrs</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View className="p-4 border-t border-gray-100">
                <TouchableOpacity
                    className="bg-blue-600 p-4 rounded-xl items-center shadow-lg shadow-blue-200"
                    onPress={handleBooking}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-xl">
                            {aiMode ? 'Send Request' : 'Confirm Booking'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
