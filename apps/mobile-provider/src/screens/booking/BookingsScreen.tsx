import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth, bookingService } from '@thelocals/platform-core';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

export const BookingsScreen = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) loadBookings();
    }, [user]);

    const loadBookings = async () => {
        try {
            if (!user) return;
            const data = await bookingService.getUserBookings(user.id);
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderBooking = useCallback(({ item }: { item: any }) => (
        <BookingItem item={item} />
    ), []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <View className="flex-1 bg-white pt-12">
            <Text className="text-2xl font-bold px-4 mb-6">My Bookings</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            loadBookings();
                        }} />
                    }
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Text className="text-gray-500">No bookings found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const BookingItem = React.memo(({ item }: { item: any }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <View className="bg-white p-4 mb-4 rounded-xl border border-gray-100 shadow-sm mx-4">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-lg text-gray-800">{item.worker?.name || 'Provider'}</Text>
                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    <Text className="text-white text-xs font-bold uppercase">{item.status}</Text>
                </View>
            </View>

            <View className="flex-row items-center mb-1">
                <Calendar size={14} color="#6B7280" {...({} as any)} />
                <Text className="text-gray-500 ml-2 text-sm">
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>

            <View className="flex-row items-center mb-3">
                <MapPin size={14} color="#6B7280" {...({} as any)} />
                <Text className="text-gray-500 ml-2 text-sm">New York, USA</Text>
            </View>

            <View className="pt-3 border-t border-gray-100 flex-row justify-between">
                <Text className="text-gray-900 font-semibold">${item.total_price}</Text>
                <TouchableOpacity>
                    <Text className="text-blue-600 font-medium">View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
});
