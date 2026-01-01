import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Chip } from '@/components/shared';

// Mock Data Types
interface Booking {
    id: string;
    serviceName: string;
    providerName?: string;
    date: string;
    time: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    price?: string;
    image?: string;
}

const mockBookings: Booking[] = [
    {
        id: '1',
        serviceName: 'AC Repair',
        providerName: 'Rajesh Kumar',
        date: 'Today',
        time: '2:30 PM',
        status: 'in_progress',
        price: '₹450',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=200',
    },
    {
        id: '2',
        serviceName: 'Home Cleaning',
        providerName: 'Sunita Devi',
        date: 'Dec 24',
        time: '10:00 AM',
        status: 'completed',
        price: '₹1200',
        image: 'https://images.unsplash.com/photo-1581578731117-104f2a921a29?q=80&w=200',
    },
    {
        id: '3',
        serviceName: 'Plumbing',
        date: 'Dec 28',
        time: '11:00 AM',
        status: 'pending',
        price: 'Est. ₹300',
    },
];

const StatusBadge = ({ status }: { status: Booking['status'] }) => {
    let variant: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';
    let label = status.replace('_', ' ');

    switch (status) {
        case 'pending':
            variant = 'warning';
            break;
        case 'accepted':
            variant = 'info';
            break;
        case 'in_progress':
            variant = 'success';
            label = 'On the way';
            break;
        case 'completed':
            variant = 'success';
            break;
        case 'cancelled':
            variant = 'error';
            break;
    }

    return <Chip label={label.toUpperCase()} variant={variant} />;
};

export const BookingsList = () => {
    const router = useRouter();
    const [filter, setFilter] = useState<'active' | 'past'>('active');

    const filteredBookings = mockBookings.filter(b => {
        if (filter === 'active') return ['pending', 'accepted', 'in_progress'].includes(b.status);
        return ['completed', 'cancelled'].includes(b.status);
    });

    const renderItem = ({ item }: { item: Booking }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(app)/booking/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{item.serviceName}</Text>
                    <Text style={styles.dateTime}>{item.date} • {item.time}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.providerRow}>
                    <View style={styles.avatarPlaceholder}>
                        <FontAwesome name="user" size={14} color={Colors.slate[400]} />
                    </View>
                    <Text style={styles.providerName}>{item.providerName || 'Waiting for provider...'}</Text>
                </View>
                <Text style={styles.price}>{item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, filter === 'active' && styles.activeTab]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.tabText, filter === 'active' && styles.activeTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, filter === 'past' && styles.activeTab]}
                    onPress={() => setFilter('past')}
                >
                    <Text style={[styles.tabText, filter === 'past' && styles.activeTabText]}>Past</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredBookings}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No {filter} bookings found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.slate[50],
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
    },
    tab: {
        marginRight: 24,
        paddingBottom: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.teal.DEFAULT,
    },
    tabText: {
        fontSize: 16,
        color: Colors.slate[500],
        fontWeight: '500',
    },
    activeTabText: {
        color: Colors.teal.DEFAULT,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.slate[900],
        marginBottom: 4,
    },
    dateTime: {
        fontSize: 14,
        color: Colors.slate[500],
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.slate[100],
        paddingTop: 12,
    },
    providerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.slate[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    providerName: {
        fontSize: 14,
        color: Colors.slate[700],
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.slate[900],
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.slate[400],
        fontSize: 16,
    }
});
