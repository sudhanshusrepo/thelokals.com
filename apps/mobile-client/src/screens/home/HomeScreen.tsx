import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin } from 'lucide-react-native';
import { bookingService } from '@thelocals/platform-core';
import { colors, radii, shadows } from '@thelocals/ui-mobile';

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
        <View style={{ flex: 1, backgroundColor: colors.backgroundBase, paddingTop: 48, paddingHorizontal: 16 }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-500 text-sm">Location</Text>
                    <View className="flex-row items-center">
                        <MapPin size={16} color={colors.primary} {...({} as any)} />
                        <Text className="font-bold text-lg ml-1" style={{ color: colors.textPrimary }}>New York, USA</Text>
                    </View>
                </View>
                <TouchableOpacity className="bg-white p-2 rounded-full" style={shadows.chip}>
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=User' }}
                        className="w-8 h-8 rounded-full"
                    />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="bg-white p-4 rounded-xl flex-row items-center mb-6" style={shadows.chip}>
                <Search size={20} color={colors.textMuted} {...({} as any)} />
                <Text className="ml-2" style={{ color: colors.textMuted }}>Find a service...</Text>
            </View>

            {/* Banner */}
            <View style={{
                backgroundColor: colors.backgroundHeroStart,
                borderRadius: radii.lg,
                padding: 24,
                marginBottom: 32,
                ...shadows.card
            }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 20, marginBottom: 4 }}>Get 20% off</Text>
                <Text style={{ color: colors.textSecondary }}>On your first home cleaning booking</Text>
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
