import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { bookingService, ServiceItem } from '@thelocals/platform-core';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ServiceSelectionScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { categoryId, categoryName } = route.params || {};

    const { context, send } = useBookingLogic('DRAFT', {
        serviceCategory: { id: categoryId, name: categoryName } as any
    });

    const [options, setOptions] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        if (!categoryId) return;
        const loadOptions = async () => {
            try {
                const items = await bookingService.getServiceItems(categoryId);
                setOptions(items as ServiceItem[]);
            } catch (err) {
                Alert.alert("Error", "Failed to load options");
            } finally {
                setLoading(false);
            }
        };
        loadOptions();
    }, [categoryId]);

    const handleSelect = (item: ServiceItem) => {
        setSelectedOption(item.id);
        const estimate = PricingUtils.calculateEstimate(item);
        send('UPDATE_CONTEXT', {
            selectedOption: item,
            price: estimate.total,
            serviceName: categoryName
        });
    };

    const activeItem = options.find(o => o.id === selectedOption);
    const estimate = activeItem ? PricingUtils.calculateEstimate(activeItem) : null;

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-5 py-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">{categoryName || 'Select Service'}</Text>
            </View>

            {/* List */}
            <ScrollView className="flex-1 p-5">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Available Options</Text>

                {options.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => handleSelect(item)}
                        className={`p-4 mb-3 rounded-2xl border-2 flex-row items-center justify-between ${selectedOption === item.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-100 bg-white'
                            }`}
                    >
                        <View className="flex-1 mr-4">
                            <Text className="font-bold text-lg text-gray-900">{item.name}</Text>
                            <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>{item.description}</Text>
                            <View className="mt-2 bg-gray-100 self-start px-2 py-1 rounded">
                                <Text className="text-xs font-bold text-gray-700">
                                    {PricingUtils.formatPrice(item.base_price)} • {item.price_unit}
                                </Text>
                            </View>
                        </View>

                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedOption === item.id ? 'border-green-500' : 'border-gray-300'
                            }`}>
                            {selectedOption === item.id && <View className="w-3 h-3 rounded-full bg-green-500" />}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Footer Bottom Sheet */}
            {selectedOption && estimate && (
                <View className="p-5 bg-white border-t border-gray-100 shadow-lg">
                    <View className="flex-row justify-between items-end mb-4">
                        <View>
                            <Text className="text-xs text-gray-500">Estimated Total</Text>
                            <Text className="text-2xl font-bold text-gray-900">{PricingUtils.formatPrice(estimate.total)}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('LiveBookingHub', {
                                categoryId,
                                initialContext: context
                            })}
                            className="bg-black px-8 py-4 rounded-xl flex-row items-center"
                        >
                            <Text className="text-white font-bold text-base mr-2">Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};
