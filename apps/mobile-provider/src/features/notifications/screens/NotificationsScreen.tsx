import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { supabase, useAuth } from '@thelocals/platform-core';
import { Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../../../components/ui/ScreenHeader';
import { EmptyState } from '../../../components/ui/EmptyState';

// Simple time formatter if date-fns not installed
const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

export const NotificationsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') { // table undefined
                    setNotifications([]); // Graceful fallback
                } else {
                    console.error(error);
                }
            } else {
                setNotifications(data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            className={`flex-row p-4 border-b border-gray-100 ${item.is_read ? 'bg-white' : 'bg-blue-50'}`}
            onPress={() => markAsRead(item.id)}
        >
            <View className="mr-4 mt-1 bg-white p-2 rounded-full border border-gray-100">
                <Bell size={20} color={item.is_read ? '#9CA3AF' : '#2563EB'} />
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between items-start">
                    <Text className={`text-base mb-1 ${item.is_read ? 'font-medium text-gray-900' : 'font-bold text-gray-900'}`}>
                        {item.title}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">{formatTimeAgo(item.created_at)}</Text>
                </View>
                <Text className="text-gray-500 leading-5">{item.message}</Text>
            </View>
            {!item.is_read && (
                <View className="ml-2 justify-center">
                    <View className="w-2 h-2 rounded-full bg-blue-600" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <ScreenHeader title="Notifications" />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshing={loading}
                    onRefresh={fetchNotifications}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={
                        <EmptyState
                            icon={Bell}
                            title="No notifications yet"
                            description="We'll let you know when you receive new jobs or updates from customers."
                        />
                    }
                />
            )}
        </View>
    );
};
