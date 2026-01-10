import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const PostBookingScreen = () => {
    const navigation = useNavigation<any>();
    const { context, send, state } = useBookingLogic();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [processing, setProcessing] = useState(false);

    const isPaymentPending = state === 'PAYMENT_PENDING';
    const isCompleted = state === 'COMPLETED';

    const handlePayment = () => {
        setProcessing(true);
        // Mock Payment
        setTimeout(() => {
            setProcessing(false);
            send('PAYMENT_SUCCESS');
        }, 1500);
    };

    const handleSubmitFeedback = () => {
        send('SUBMIT_FEEDBACK', { rating } as any);
        navigation.navigate('HomeIndex');
    };

    if (isPaymentPending) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark" size={40} color="green" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Job Completed!</Text>
                <Text className="text-gray-500 mb-8 text-center">Please settle the payment to complete the booking.</Text>

                <View className="w-full bg-gray-50 p-5 rounded-xl mb-8 flex-row justify-between items-center">
                    <Text className="font-bold text-gray-700">Total Amount</Text>
                    <Text className="font-bold text-2xl text-gray-900">{PricingUtils.formatPrice(context.price || 0)}</Text>
                </View>

                <TouchableOpacity
                    onPress={handlePayment}
                    disabled={processing}
                    className="w-full bg-black py-4 rounded-xl items-center flex-row justify-center"
                >
                    {processing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="card" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold text-lg">Pay Securely</Text>
                        </>
                    )}
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (isCompleted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">How was {context.provider?.name}?</Text>
                <Text className="text-gray-500 mb-8">Your feedback helps us improve.</Text>

                <View className="flex-row gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={40}
                                color={star <= rating ? "#FBBF24" : "#E5E7EB"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder="Share your experience (optional)..."
                    multiline
                    numberOfLines={4}
                    className="w-full p-4 bg-gray-50 rounded-xl mb-6 text-base"
                    style={{ textAlignVertical: 'top' }}
                />

                <TouchableOpacity
                    onPress={handleSubmitFeedback}
                    disabled={rating === 0}
                    className={`w-full py-4 rounded-xl items-center ${rating > 0 ? 'bg-black' : 'bg-gray-200'
                        }`}
                >
                    <Text className={`font-bold text-lg ${rating > 0 ? 'text-white' : 'text-gray-400'}`}>Submit Feedback</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
        </View>
    );
};
