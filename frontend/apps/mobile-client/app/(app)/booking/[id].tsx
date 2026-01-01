import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

export default function BookingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Mock Detail Data (would fetch by ID)
    const booking = {
        id,
        service: 'AC Repair',
        status: 'in_progress',
        timeline: [
            { title: 'Booking Created', time: '10:00 AM', completed: true },
            { title: 'Provider Assigned', time: '10:05 AM', completed: true },
            { title: 'In Progress', time: 'Now', completed: true, active: true },
            { title: 'Service Completed', time: '-', completed: false },
        ]
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={Colors.slate[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking #{id}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Banner */}
                <View style={styles.statusBanner}>
                    <Text style={styles.statusTitle}>Provider is on the way</Text>
                    <Text style={styles.statusSub}>Expected arrival: 2:30 PM</Text>
                    <View style={styles.pinContainer}>
                        <Text style={styles.pinLabel}>PIN</Text>
                        <Text style={styles.pinCode}>4582</Text>
                    </View>
                </View>

                {/* Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Timeline</Text>
                    <View style={styles.timeline}>
                        {booking.timeline.map((step, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View style={[
                                        styles.dot,
                                        step.completed ? styles.dotCompleted : styles.dotPending,
                                        step.active && styles.dotActive
                                    ]} />
                                    {index < booking.timeline.length - 1 && (
                                        <View style={[styles.line, step.completed && styles.lineCompleted]} />
                                    )}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={[styles.stepTitle, step.active && styles.stepTitleActive]}>
                                        {step.title}
                                    </Text>
                                    <Text style={styles.stepTime}>{step.time}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Service Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <View style={styles.detailCard}>
                        <Text style={styles.detailLabel}>Service</Text>
                        <Text style={styles.detailValue}>AC Repair (General Service)</Text>

                        <View style={styles.divider} />

                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>Block C, HSR Layout, Bangalore</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Actions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>Need Help?</Text>
                </TouchableOpacity>
                {booking.status === 'pending' && (
                    <TouchableOpacity style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.slate[900],
    },
    content: {
        padding: 20,
    },
    statusBanner: {
        backgroundColor: Colors.teal[50],
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: Colors.teal[100],
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.teal[900],
        marginBottom: 4,
    },
    statusSub: {
        fontSize: 14,
        color: Colors.teal[700],
        marginBottom: 16,
    },
    pinContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.teal[200],
    },
    pinLabel: {
        fontSize: 10,
        color: Colors.slate[400],
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    pinCode: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.slate[900],
        letterSpacing: 4,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.slate[900],
        marginBottom: 16,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 20,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.slate[200],
        zIndex: 2,
    },
    dotCompleted: {
        backgroundColor: Colors.teal.DEFAULT,
    },
    dotPending: {
        backgroundColor: Colors.slate[200],
    },
    dotActive: {
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: Colors.teal.DEFAULT,
        width: 14,
        height: 14,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: Colors.slate[200],
        position: 'absolute',
        top: 12,
        bottom: -24,
        left: 5, // Center of width 12 is 6, minus 1 for line width approx
        zIndex: 1,
    },
    lineCompleted: {
        backgroundColor: Colors.teal.DEFAULT,
    },
    timelineContent: {
        flex: 1,
        paddingTop: -4,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.slate[500],
        marginBottom: 2,
    },
    stepTitleActive: {
        color: Colors.slate[900],
        fontWeight: '700',
    },
    stepTime: {
        fontSize: 12,
        color: Colors.slate[400],
    },
    detailCard: {
        backgroundColor: Colors.slate[50],
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.slate[100],
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.slate[400],
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: Colors.slate[900],
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.slate[200],
        marginVertical: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.slate[200],
    },
    helpButton: {
        padding: 16,
        alignItems: 'center',
    },
    helpButtonText: {
        color: Colors.slate[500],
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 8,
        alignItems: 'center',
        padding: 12,
    },
    cancelButtonText: {
        color: Colors.red.DEFAULT,
        fontWeight: '600',
    },
});
