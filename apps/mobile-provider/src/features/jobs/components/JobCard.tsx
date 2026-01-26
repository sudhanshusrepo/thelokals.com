import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Booking } from '@thelocals/platform-core';
import { StatusBadge } from '../../../components/StatusBadge';
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react-native';

interface JobCardProps {
    booking: Booking;
    onPress: () => void;
    isRequest?: boolean;
}

export const JobCard = ({ booking, onPress, isRequest = false }: JobCardProps) => {
    // Format Date
    const dateObj = booking.scheduled_date ? new Date(booking.scheduled_date) : new Date(booking.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Customer Avatar (simulated or real)
    const avatarUrl = booking.user?.avatarUrl || `https://ui-avatars.com/api/?name=${booking.user?.name || 'Customer'}&background=random`;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
        >
            <View className="p-4">
                {/* Header: Status and Price */}
                <View className="flex-row justify-between items-start mb-3">
                    <StatusBadge status={booking.status} />
                    {booking.provider_earnings ? (
                        <Text className="text-gray-900 font-bold text-lg">
                            ${booking.provider_earnings}
                        </Text>
                    ) : (
                        <Text className="text-gray-400 text-sm italic">Est. required</Text>
                    )}
                </View>

                {/* Main Content: Avatar + Info */}
                <View className="flex-row gap-3 items-center">
                    <Image
                        source={{ uri: avatarUrl }}
                        className="w-12 h-12 rounded-full bg-gray-200"
                    />
                    <View className="flex-1">
                        <Text className="text-gray-900 font-semibold text-base mb-0.5" numberOfLines={1}>
                            {booking.service_category}
                        </Text>
                        <Text className="text-gray-500 text-sm" numberOfLines={1}>
                            {booking.user?.name || 'Guest User'}
                        </Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </View>

                {/* Footer: Details */}
                <View className="mt-4 pt-3 border-t border-gray-50 flex-row gap-4">
                    <View className="flex-row items-center gap-1.5 flex-1">
                        <Calendar size={14} color="#6B7280" />
                        <Text className="text-gray-500 text-xs font-medium">{dateStr}</Text>
                        <View className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
                        <Clock size={14} color="#6B7280" />
                        <Text className="text-gray-500 text-xs font-medium">{timeStr}</Text>
                    </View>
                </View>

                {/* Address Row (if space permits or if critical) */}
                {booking.address?.formatted && (
                    <View className="flex-row items-start gap-1.5 mt-2">
                        <MapPin size={14} color="#6B7280" className="mt-0.5" />
                        <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>
                            {booking.address.formatted}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Strip (Optional for Requests) */}
            {isRequest && (
                <View className="bg-blue-50 px-4 py-3 flex-row items-center justify-between border-t border-blue-100">
                    <Text className="text-blue-700 text-xs font-semibold">New Job Request</Text>
                    <Text className="text-blue-700 text-xs font-bold">Review Now</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
