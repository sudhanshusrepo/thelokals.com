import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { bookingService } from '@thelocals/platform-core';
import { Search, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen = () => {
    const navigation = useNavigation<any>();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await bookingService.getServiceCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderCategory = useCallback(({ item }: { item: any }) => (
        <CategoryItem item={item} onPress={() => navigation.navigate('ServiceDetail', { category: item })} />
    ), [navigation]);

    return (
        <View className="flex-1 bg-white pt-12 px-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-500 text-sm">Location</Text>
                    <View className="flex-row items-center">
                        <MapPin size={16} color="#2563EB" {...({} as any)} />
                        <Text className="font-bold text-lg ml-1">New York, USA</Text>
                    </View>
                </View>
                <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=User' }}
                        className="w-8 h-8 rounded-full"
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="bg-gray-100 p-4 rounded-xl flex-row items-center mb-6">
                <Search size={20} color="gray" {...({} as any)} />
                <Text className="ml-2 text-gray-500">Find a service...</Text>
            </View>

            {/* Banner */}
            <View className="bg-blue-600 p-6 rounded-2xl mb-8">
                <Text className="text-white font-bold text-xl mb-1">Get 20% off</Text>
                <Text className="text-blue-100">On your first home cleaning booking</Text>
            </View>

            {/* Categories */}
            <Text className="font-bold text-xl mb-4">Categories</Text>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                />
            )}
        </View>
    );
};

const CategoryItem = React.memo(({ item, onPress }: { item: any, onPress: () => void }) => (
    <TouchableOpacity
        className="flex-1 m-2 p-4 bg-gray-50 rounded-xl items-center border border-gray-100"
        onPress={onPress}
    >
        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
            <Text className="text-xl">🛠️</Text>
        </View>
        <Text className="font-semibold text-gray-800">{item.name}</Text>
    </TouchableOpacity>
));
