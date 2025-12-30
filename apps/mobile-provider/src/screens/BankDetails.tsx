import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const BankDetailsScreen = () => {
    const navigation = useNavigation();
    const [upiId, setUpiId] = useState('sudhanshu@upi');

    const withdrawals = [
        { id: 1, amount: '₹12,450', date: 'Dec 15, 2024', status: 'Completed' },
        { id: 2, amount: '₹8,200', date: 'Nov 30, 2024', status: 'Completed' },
        { id: 3, amount: '₹1,250', date: 'Nov 15, 2024', status: 'Completed' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bank & UPI</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Primary Payout Method</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>UPI ID</Text>
                    <TextInput
                        style={styles.input}
                        value={upiId}
                        onChangeText={setUpiId}
                        placeholder="Enter UPI ID"
                    />
                    <TouchableOpacity style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Withdrawal History</Text>
                {withdrawals.map(item => (
                    <View key={item.id} style={styles.historyItem}>
                        <View>
                            <Text style={styles.amount}>{item.amount}</Text>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                        <Text style={styles.status}>{item.status}</Text>
                    </View>
                ))}
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    content: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        marginRight: 16,
    },
    backText: {
        fontSize: 16,
        color: '#333',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#666',
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
        marginBottom: 12,
    },
    updateButton: {
        backgroundColor: '#0E121A',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    historyItem: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0E121A',
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
    status: {
        fontSize: 14,
        color: '#10B981', // Green
        fontWeight: '500',
    }
});
