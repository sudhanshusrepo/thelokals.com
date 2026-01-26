import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { providerService, Booking } from '@thelocals/platform-core';
import { StatusBadge } from '../../components/StatusBadge';
import { MapPin, Phone, MessageSquare, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react-native';
import { LiveMap } from '../maps/components/LiveMap';
import * as Linking from 'expo-linking';

export const JobDetailsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { bookingId } = route.params || {};

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const data = await providerService.getJobDetails(bookingId);
            setBooking(data);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: any) => {
        if (!booking) return;
        setActionLoading(true);
        try {
            if (newStatus === 'ACCEPTED') {
                // Logic handled in service/UI elsewhere or simplified for now
            } else {
                await providerService.updateBookingStatus(booking.id, newStatus);
            }
            await fetchBooking();
            Alert.alert("Success", "Status updated");
        } catch (err) {
            Alert.alert("Error", "Failed to update status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleNavigation = () => {
        if (!booking?.location) return;
        const { lat, lng } = booking.location;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = 'Job Location';
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) Linking.openURL(url);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!booking) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Job not found</Text>
            </View>
        );
    }

    // derived
    const customer = booking.user;
    const isRequest = booking.status === 'REQUESTED' || booking.status === 'PENDING';

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* Map View */}
                <View className="h-56 bg-white">
                    {booking.location ? (
                        <LiveMap
                            destination={booking.location}
                            height={224}
                            showNavigation
                            onNavigationStart={handleNavigation}
                        />
                    ) : (
                        <View className="h-full bg-gray-200 justify-center items-center">
                            <MapPin size={40} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-2 font-medium">No Location Provided</Text>
                        </View>
                    )}
                </View>

                <View className="p-5">
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 mb-1">{booking.service_category}</Text>
                            <StatusBadge status={booking.status} />
                        </View>
                        <Text className="text-xl font-bold text-gray-900">${booking.provider_earnings}</Text>
                    </View>

                    {/* Customer Info */}
                    <View className="bg-gray-50 p-4 rounded-xl mb-6">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-3">Customer</Text>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <Image
                                    source={{ uri: customer?.avatarUrl || `https://ui-avatars.com/api/?name=${customer?.name || 'User'}` }}
                                    className="w-10 h-10 rounded-full"
                                />
                                <View>
                                    <Text className="font-bold text-gray-900">{customer?.name || 'Guest Details'}</Text>
                                    <Text className="text-gray-500 text-xs">Verified Customer</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200">
                                    <MessageSquare size={20} color="#374151" />
                                </TouchableOpacity>
                                <TouchableOpacity className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
                                    <Phone size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Job Details */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-3">Location & Time</Text>
                        <View className="gap-4">
                            <View className="flex-row gap-3">
                                <MapPin size={20} color="#6B7280" />
                                <Text className="flex-1 text-gray-700">{booking.address?.formatted || 'No Address Provided'}</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <Calendar size={20} color="#6B7280" />
                                <Text className="flex-1 text-gray-700">
                                    {new Date(booking.scheduled_date || booking.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View className="flex-row gap-3">
                                <Clock size={20} color="#6B7280" />
                                <Text className="flex-1 text-gray-700">
                                    {new Date(booking.scheduled_date || booking.created_at).toLocaleTimeString()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Notes</Text>
                    <Text className="text-gray-700 mb-8 leading-5">
                        {booking.notes || "No additional notes provided by the customer."}
                    </Text>
                </View>
            </ScrollView>

            {/* Sticky Action Footer */}
            <View className="p-4 bg-white border-t border-gray-100 pb-8">
                {isRequest ? (
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                            onPress={() => Alert.alert("Coming Soon", "Rejection workflow is coming soon.")}
                        >
                            <Text className="font-bold text-gray-900">Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                            onPress={() => handleStatusUpdate('ACCEPTED')}
                        >
                            <Text className="font-bold text-white">Accept Job</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {booking.status === 'CONFIRMED' && (
                            <TouchableOpacity
                                className="w-full bg-blue-600 py-4 rounded-xl items-center flex-row justify-center gap-2"
                                onPress={() => handleStatusUpdate('EN_ROUTE')}
                            >
                                <Text className="font-bold text-white text-lg">Start Journey</Text>
                            </TouchableOpacity>
                        )}
                        {booking.status === 'EN_ROUTE' && (
                            <TouchableOpacity
                                className="w-full bg-purple-600 py-4 rounded-xl items-center flex-row justify-center gap-2"
                                onPress={() => handleStatusUpdate('IN_PROGRESS')}
                            >
                                <Text className="font-bold text-white text-lg">Arrived & Start Job</Text>
                            </TouchableOpacity>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                            <TouchableOpacity
                                className="w-full bg-green-600 py-4 rounded-xl items-center flex-row justify-center gap-2"
                                onPress={() => handleStatusUpdate('COMPLETED')}
                            >
                                <CheckCircle size={20} color="white" />
                                <Text className="font-bold text-white text-lg">Complete Job</Text>
                            </TouchableOpacity>
                        )}
                        {booking.status === 'COMPLETED' && (
                            <View className="w-full bg-gray-100 py-4 rounded-xl items-center">
                                <Text className="font-bold text-green-700 text-lg">Job Completed</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};
