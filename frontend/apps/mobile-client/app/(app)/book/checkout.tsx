import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useLocation } from '@/contexts/LocationContext';

export default function CheckoutScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { location } = useLocation();
    const address = location?.formattedAddress;
    const city = location?.city;

    // Mock params processing
    const serviceName = params.serviceName || "Requested Service";
    const price = params.price || "TBD";
    const tier = params.tier || "Standard";

    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [payWithWallet, setPayWithWallet] = useState(false);
    const [instructions, setInstructions] = useState('');

    const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    const dates = ['Today', 'Tomorrow', 'Sat, 28 Dec'];

    const handleConfirmBooking = () => {
        // Here we would create the booking in Supabase
        // For now, navigate to the unified booking tracker with a new ID
        router.push({
            pathname: '/(app)/booking/[id]',
            params: { id: 'new_created_123' }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={20} color={Colors.slate[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Service Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>SERVICE DETAILS</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIcon}>
                            <FontAwesome name="wrench" size={20} color={Colors.teal.DEFAULT} />
                        </View>
                        <View>
                            <Text style={styles.serviceName}>{serviceName}</Text>
                            <Text style={styles.serviceTier}>{tier}</Text>
                        </View>
                        <Text style={styles.price}>{price}</Text>
                    </View>
                </View>

                {/* Date & Time */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>WHEN</Text>
                    <View style={styles.chipsRow}>
                        {dates.map((d) => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.chip, selectedDate === d && styles.chipSelected]}
                                onPress={() => setSelectedDate(d)}
                            >
                                <Text style={[styles.chipText, selectedDate === d && styles.chipTextSelected]}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.chipsRow, { marginTop: 12 }]}>
                        {timeSlots.map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, selectedTime === t && styles.chipSelected]}
                                onPress={() => setSelectedTime(t)}
                            >
                                <Text style={[styles.chipText, selectedTime === t && styles.chipTextSelected]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Location */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>LOCATION</Text>
                    <View style={styles.locationRow}>
                        <FontAwesome name="map-marker" size={24} color={Colors.red[500]} />
                        <View style={styles.locationTextContainer}>
                            <Text style={styles.locationTitle}>Home</Text>
                            <Text style={styles.locationAddress} numberOfLines={2}>
                                {address ? `${address}, ${city}` : 'No location detected. Tap to set.'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => Alert.alert("Edit Address", "Map feature coming soon.")}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Add instructions (e.g., Gate code, landmark)"
                        placeholderTextColor={Colors.slate[400]}
                        value={instructions}
                        onChangeText={setInstructions}
                    />
                </View>

                {/* Payment */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>PAYMENT</Text>
                    <View style={styles.paymentRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome name="money" size={20} color={Colors.green[600]} />
                            <Text style={styles.paymentMethod}>Cash after service</Text>
                        </View>
                        {!payWithWallet && <FontAwesome name="check-circle" size={20} color={Colors.teal.DEFAULT} />}
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.paymentRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome name="google-wallet" size={20} color={Colors.purple[500]} />
                            <Text style={styles.paymentMethod}>Use Wallet Balance (₹0)</Text>
                        </View>
                        <Switch
                            value={payWithWallet}
                            onValueChange={setPayWithWallet}
                            trackColor={{ false: Colors.slate[200], true: Colors.teal[200] }}
                            thumbColor={payWithWallet ? Colors.teal.DEFAULT : '#f4f3f4'}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Total to Pay</Text>
                    <Text style={styles.totalAmount}>{price}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleConfirmBooking}>
                    <Text style={styles.bookButtonText}>Confirm Booking</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.slate[900],
    },
    backBtn: {
        padding: 5,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.slate[400],
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.teal[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.slate[900],
    },
    serviceTier: {
        fontSize: 14,
        color: Colors.slate[500],
    },
    price: {
        marginLeft: 'auto',
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.slate[900],
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.slate[200],
        backgroundColor: '#fff',
    },
    chipSelected: {
        backgroundColor: Colors.teal[50],
        borderColor: Colors.teal.DEFAULT,
    },
    chipText: {
        fontSize: 14,
        color: Colors.slate[600],
    },
    chipTextSelected: {
        color: Colors.teal[700],
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.slate[900],
    },
    locationAddress: {
        fontSize: 14,
        color: Colors.slate[500],
    },
    editLink: {
        color: Colors.teal.DEFAULT,
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        backgroundColor: Colors.slate[50],
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: Colors.slate[900],
        marginTop: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    paymentMethod: {
        fontSize: 16,
        color: Colors.slate[700],
        fontWeight: '500',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.slate[100],
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: Colors.slate[200],
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    totalLabel: {
        fontSize: 12,
        color: Colors.slate[500],
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.slate[900],
    },
    bookButton: {
        backgroundColor: Colors.teal.DEFAULT,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
