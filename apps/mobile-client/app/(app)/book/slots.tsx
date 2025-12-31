import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { CLIENT_V2_TOKENS } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useBooking, Slot } from '../../../contexts/BookingContext';

// Mock dates and slots
const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push({
            id: date.toISOString(),
            date: date,
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
            day: date.getDate(),
        });
    }
    return dates;
};

const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 19; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            const available = Math.random() > 0.3; // 70% available
            slots.push({
                id: time,
                date: '',
                time: time,
                available: available,
            });
        }
    }
    return slots;
};

export default function SlotSelectionScreen() {
    const router = useRouter();
    const { booking, updateBooking } = useBooking();
    const [selectedDate, setSelectedDate] = useState(generateDates()[0]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(booking.slot);
    const dates = generateDates();
    const timeSlots = generateTimeSlots();

    const handleContinue = () => {
        if (selectedSlot) {
            updateBooking({ slot: { ...selectedSlot, date: selectedDate.id } });
            router.push('/(app)/book/address');
        }
    };

    return (
        <View style={styles.container}>
            {/* Stepper */}
            <View style={styles.stepper}>
                {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={styles.stepperItem}>
                        <View style={[styles.stepperDot, step <= 2 && styles.stepperDotActive]} />
                        {step < 4 && <View style={[styles.stepperLine, step < 2 && styles.stepperLineActive]} />}
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Select Date & Time</Text>
                <Text style={styles.subtitle}>Choose when you want the service</Text>

                {/* Date Strip */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={dates}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.dateStrip}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.dateCard,
                                selectedDate.id === item.id && styles.dateCardSelected,
                            ]}
                            onPress={() => setSelectedDate(item)}
                        >
                            <Text style={[styles.dateLabel, selectedDate.id === item.id && styles.dateLabelSelected]}>
                                {item.label}
                            </Text>
                            <Text style={[styles.dateDay, selectedDate.id === item.id && styles.dateDaySelected]}>
                                {item.day}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                {/* Time Slots */}
                <Text style={styles.sectionTitle}>Available Time Slots</Text>
                <View style={styles.slotsGrid}>
                    {timeSlots.map((slot) => (
                        <TouchableOpacity
                            key={slot.id}
                            style={[
                                styles.slotChip,
                                !slot.available && styles.slotChipUnavailable,
                                selectedSlot?.id === slot.id && styles.slotChipSelected,
                            ]}
                            onPress={() => slot.available && setSelectedSlot(slot)}
                            disabled={!slot.available}
                        >
                            <Text
                                style={[
                                    styles.slotText,
                                    !slot.available && styles.slotTextUnavailable,
                                    selectedSlot?.id === slot.id && styles.slotTextSelected,
                                ]}
                            >
                                {slot.time}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedSlot && styles.continueButtonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedSlot}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    stepper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
    },
    stepperItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepperDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DDD',
    },
    stepperDotActive: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    stepperLine: {
        width: 40,
        height: 2,
        backgroundColor: '#DDD',
        marginHorizontal: 4,
    },
    stepperLineActive: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 8,
        fontFamily: CLIENT_V2_TOKENS.typography.fontFamily,
    },
    subtitle: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        marginBottom: 24,
    },
    dateStrip: {
        marginBottom: 24,
    },
    dateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        padding: 16,
        marginRight: 12,
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dateCardSelected: {
        borderColor: CLIENT_V2_TOKENS.colors.gradientStart,
        backgroundColor: 'rgba(247,200,70,0.1)',
    },
    dateLabel: {
        fontSize: 12,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        marginBottom: 4,
    },
    dateLabelSelected: {
        color: CLIENT_V2_TOKENS.colors.gradientStart,
        fontWeight: '600',
    },
    dateDay: {
        fontSize: 20,
        fontWeight: '700',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    dateDaySelected: {
        color: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 16,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    slotChip: {
        backgroundColor: '#8AE98D',
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        paddingHorizontal: 20,
        paddingVertical: 12,
        margin: 6,
    },
    slotChipUnavailable: {
        backgroundColor: '#DDD',
    },
    slotChipSelected: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    slotText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    slotTextUnavailable: {
        color: '#999',
    },
    slotTextSelected: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    continueButton: {
        backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
        padding: 16,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#CCC',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
