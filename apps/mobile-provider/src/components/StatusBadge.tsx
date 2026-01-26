import React from 'react';
import { View, Text } from 'react-native';
import { BookingStatus } from '@thelocals/platform-core';

interface StatusBadgeProps {
    status: BookingStatus;
    className?: string; // Additional classes
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    let bgClass = "bg-gray-100";
    let textClass = "text-gray-800";
    let label = status as string;

    switch (status) {
        case 'REQUESTED':
        case 'PENDING':
            bgClass = "bg-yellow-100";
            textClass = "text-yellow-800";
            label = "Pending";
            break;
        case 'CONFIRMED':
            bgClass = "bg-blue-100";
            textClass = "text-blue-800";
            label = "Confirmed";
            break;
        case 'EN_ROUTE':
            bgClass = "bg-indigo-100";
            textClass = "text-indigo-800";
            label = "En Route";
            break;
        case 'IN_PROGRESS':
            bgClass = "bg-purple-100";
            textClass = "text-purple-800";
            label = "In Progress";
            break;
        case 'COMPLETED':
            bgClass = "bg-green-100";
            textClass = "text-green-800";
            label = "Completed";
            break;
        case 'CANCELLED':
            bgClass = "bg-red-100";
            textClass = "text-red-800";
            label = "Cancelled";
            break;
        case 'EXPIRED':
            bgClass = "bg-gray-200";
            textClass = "text-gray-600";
            label = "Expired";
            break;
    }

    return (
        <View className={`rounded-full px-2 py-1 items-center justify-center self-start ${bgClass} ${className}`}>
            <Text className={`text-xs font-semibold ${textClass}`}>
                {label}
            </Text>
        </View>
    );
};
