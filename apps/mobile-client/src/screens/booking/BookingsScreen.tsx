import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { useAuth, bookingService } from '@thelocals/platform-core';
import { Surface, StatusChip, colors } from '@thelocals/ui-mobile';

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

    return (
        <View style={{ flex: 1, backgroundColor: colors.backgroundBase, paddingTop: 48 }}>
            <Text className="text-2xl font-bold px-4 mb-6" style={{ color: colors.textPrimary }}>My Bookings</Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
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
                            <Text style={{ color: colors.textMuted }}>No bookings found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const BookingItem = React.memo(({ item }: { item: any }) => {
    const getStatusTone = (status: string): 'success' | 'warning' | 'neutral' => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'neutral';
            default: return 'neutral';
        }
    };

    return (
        <Surface elevated padding="md" style={{ marginBottom: 16 }}>
            <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-lg" style={{ color: colors.textPrimary }}>{item.worker?.name || 'Provider'}</Text>
                <StatusChip label={item.status} tone={getStatusTone(item.status)} />
            </View>

            <View className="flex-row items-center mb-1">
                <Calendar size={14} color={colors.textSecondary} {...({} as any)} />
                <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>

            <View className="flex-row items-center mb-3">
                <MapPin size={14} color={colors.textSecondary} {...({} as any)} />
                <Text className="ml-2 text-sm" style={{ color: colors.textSecondary }}>New York, USA</Text>
            </View>

            <View className="pt-3 border-t border-gray-100 flex-row justify-between">
                <Text className="font-semibold" style={{ color: colors.textPrimary }}>${item.total_price}</Text>
                <TouchableOpacity>
                    <Text className="font-medium" style={{ color: colors.primary }}>View Details</Text>
                </TouchableOpacity>
            </View>
        </Surface>
    )
});
