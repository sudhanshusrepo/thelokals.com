import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { paymentService } from '@thelocals/platform-core';
import { CreditCard, Wallet, ChevronRight } from 'lucide-react-native';

export const PaymentScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { bookingData, amount } = route.params;

    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'wallet'>('card');

    const handlePay = async () => {
        setLoading(true);
        try {
            // 1. Create Intent
            const intent = await paymentService.createPaymentIntent(amount);

            // 2. Simulate User Payment Interaction
            // In real app, we would use Stripe PaymentSheet here

            // 3. Confirm
            const result = await paymentService.confirmPayment(intent.id);

            if (result.success) {
                navigation.replace('BookingConfirmation', { bookingId: 'mock_id_123', ...bookingData });
            } else {
                Alert.alert("Payment Failed", "Please try again.");
            }

        } catch (error: any) {
            Alert.alert("Error", error.message || "Payment processing failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-6">
            <Text className="text-xl font-bold mb-6 text-center">Checkout</Text>

            <View className="bg-blue-50 p-6 rounded-2xl mb-8 items-center">
                <Text className="text-gray-500 mb-2">Total Amount</Text>
                <Text className="text-4xl font-bold text-blue-600">${amount}</Text>
            </View>

            <Text className="font-semibold text-lg mb-4">Payment Method</Text>

            <TouchableOpacity
                className={`flex-row items-center p-4 rounded-xl border ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onPress={() => setSelectedMethod('card')}
            >
                <CreditCard size={24} color={selectedMethod === 'card' ? '#2563EB' : '#6B7280'} {...({} as any)} />
                <Text className="ml-3 flex-1 font-semibold text-gray-800">Credit / Debit Card</Text>
                {selectedMethod === 'card' && <View className="w-4 h-4 rounded-full bg-blue-600" />}
            </TouchableOpacity>

            <TouchableOpacity
                className={`flex-row items-center p-4 rounded-xl border mt-3 ${selectedMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onPress={() => setSelectedMethod('wallet')}
            >
                <Wallet size={24} color={selectedMethod === 'wallet' ? '#2563EB' : '#6B7280'} {...({} as any)} />
                <Text className="ml-3 flex-1 font-semibold text-gray-800">Apple Pay / Google Pay</Text>
                {selectedMethod === 'wallet' && <View className="w-4 h-4 rounded-full bg-blue-600" />}
            </TouchableOpacity>

            <View className="flex-1" />

            <TouchableOpacity
                className="bg-blue-600 p-4 rounded-xl items-center mb-4"
                onPress={handlePay}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Pay ${amount}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
