import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { bookingService } from '@thelocals/platform-core';

export const ServiceDetailScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { category } = route.params;
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        try {
            // Mock location for now (New York)
            const data = await bookingService.findNearbyProviders(category.id, 40.7128, -74.0060, 10000);
            setProviders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderProvider = useCallback(({ item }: { item: any }) => (
        <ProviderItem item={item} onPress={() => navigation.navigate('BookingForm', { provider: item, category })} />
    ), [navigation, category]);

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-6 text-gray-900">{category.name} Pros</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : providers.length > 0 ? (
                <FlatList
                    data={providers}
                    renderItem={renderProvider}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            ) : (
                <View className="items-center mt-10">
                    <Text className="text-gray-500 text-lg">No providers found nearby.</Text>
                    <TouchableOpacity
                        className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
                        onPress={() => navigation.navigate('BookingForm', { category, aiMode: true })}
                    >
                        <Text className="text-white font-bold">Try AI Booking</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const ProviderItem = React.memo(({ item, onPress }: { item: any, onPress: () => void }) => (
    <TouchableOpacity
        className="bg-white p-4 mb-4 rounded-xl border border-gray-100 shadow-sm"
        onPress={onPress}
    >
        <View className="flex-row justify-between items-center">
            <View>
                <Text className="font-bold text-lg text-gray-800">{item.name || 'Provider'}</Text>
                <Text className="text-gray-500">⭐ {(4.8).toFixed(1)} • {item.distance || '2km'} away</Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 font-semibold">${item.price || 40}/hr</Text>
            </View>
        </View>
    </TouchableOpacity>
));
