import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { useAuth, providerService, AvailabilitySchedule } from '@thelocals/platform-core';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus } from 'lucide-react-native';

export const ScheduleScreen = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigation = useNavigation();
    const [items, setItems] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Initial load: parse profile.availabilitySchedule
    useEffect(() => {
        if (profile?.availabilitySchedule) {
            parseSchedule(profile.availabilitySchedule);
        }
    }, [profile]);

    const parseSchedule = (schedule: AvailabilitySchedule) => {
        // Transform { "2024-01-25": [{ start: "10:00", end: "12:00" }] } 
        // to Agenda items format.
        // Actually, for this MVP, let's assume we just managing "Availability Blocks".
        // The type is Record<string, { start: string; end: string }[]>;
        const newItems: any = {};
        Object.entries(schedule).forEach(([date, slots]) => {
            newItems[date] = slots.map(slot => ({
                name: `Available ${slot.start} - ${slot.end}`,
                height: 50,
                type: 'availability'
            }));
        });
        setItems(newItems);
    };

    const handleDayPress = (day: any) => {
        // For MVP, we toggle "Full Day Availability" on press if empty, or clear if exists.
        // In real app, we would open a modal to pick time ranges.
        const dateStr = day.dateString;
        const currentSlots = items[dateStr] || [];

        if (currentSlots.length > 0) {
            // Remove availability
            Alert.alert(
                "Remove Availability",
                `Mark ${dateStr} as unavailable?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => updateSchedule(dateStr, [])
                    }
                ]
            );
        } else {
            // Add default 9-5
            Alert.alert(
                "Add Availability",
                `Mark ${dateStr} as available (09:00 - 17:00)?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Add",
                        onPress: () => updateSchedule(dateStr, [{ start: '09:00', end: '17:00' }])
                    }
                ]
            );
        }
    };

    const updateSchedule = async (date: string, slots: { start: string, end: string }[]) => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const currentSchedule = { ...(profile.availabilitySchedule || {}) };

            if (slots.length === 0) {
                delete currentSchedule[date];
            } else {
                currentSchedule[date] = slots;
            }

            // Optimistic update
            parseSchedule(currentSchedule);

            // Save to DB
            await providerService.updateProfile(profile.id, {
                availabilitySchedule: currentSchedule
            });
            await refreshProfile();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to update schedule");
            // Revert on error would be ideal
        } finally {
            setLoading(false);
        }
    };

    const renderItem = (item: any) => {
        return (
            <TouchableOpacity className="bg-white p-4 mr-4 mt-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <Text className="text-base font-bold text-gray-800">{item.name}</Text>
                <Text className="text-gray-500 text-xs">Tap day to manage</Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return (
            <View className="h-12 pt-4 border-b border-gray-100 mr-4">
                <Text className="text-gray-400">No availability set</Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Manage Schedule</Text>
                </View>
                {loading && <ActivityIndicator size="small" color="#2563EB" />}
            </View>

            <Agenda
                items={items}
                loadItemsForMonth={(month) => {

                    // In real app, fetch data for specific month here
                }}
                selected={new Date().toISOString().split('T')[0]}
                renderItem={renderItem}
                renderEmptyDate={renderEmptyDate}
                onDayPress={handleDayPress}
                showClosingKnob={true}
                theme={{
                    selectedDayBackgroundColor: '#2563EB',
                    todayTextColor: '#2563EB',
                    dotColor: '#2563EB',
                    agendaDayTextColor: '#4B5563',
                    agendaDayNumColor: '#4B5563',
                    agendaTodayColor: '#2563EB',
                    agendaKnobColor: '#D1D5DB'
                }}
            />
        </View>
    );
};
