import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

interface BookingRequest {
    id: string;
    serviceCategory: string;
    clientName: string;
    clientLocation: {
        lat: number;
        lng: number;
    };
    estimatedCost: number;
    distance: number; // in km
    requirements: string;
}

interface IncomingRequestModalProps {
    visible: boolean;
    request: BookingRequest | null;
    providerLocation: { lat: number; lng: number } | null;
    onAccept: () => void;
    onReject: () => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
    visible,
    request,
    providerLocation,
    onAccept,
    onReject
}) => {
    if (!request) return null;

    const region = providerLocation ? {
        latitude: (providerLocation.lat + request.clientLocation.lat) / 2,
        longitude: (providerLocation.lng + request.clientLocation.lng) / 2,
        latitudeDelta: Math.abs(providerLocation.lat - request.clientLocation.lat) * 2 || 0.05,
        longitudeDelta: Math.abs(providerLocation.lng - request.clientLocation.lng) * 2 || 0.05,
    } : {
        latitude: request.clientLocation.lat,
        longitude: request.clientLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onReject}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>New Booking Request</Text>
                        <Text style={styles.headerSubtitle}>⏱️ Respond within 2 minutes</Text>
                    </View>

                    {/* Map Preview */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            provider={PROVIDER_DEFAULT}
                            region={region}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: request.clientLocation.lat,
                                    longitude: request.clientLocation.lng
                                }}
                                title="Client Location"
                                pinColor="red"
                            />
                            {providerLocation && (
                                <Marker
                                    coordinate={{
                                        latitude: providerLocation.lat,
                                        longitude: providerLocation.lng
                                    }}
                                    title="Your Location"
                                    pinColor="blue"
                                />
                            )}
                        </MapView>
                    </View>

                    {/* Booking Details */}
                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Service:</Text>
                            <Text style={styles.detailValue}>{request.serviceCategory}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Client:</Text>
                            <Text style={styles.detailValue}>{request.clientName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Distance:</Text>
                            <Text style={styles.detailValue}>{request.distance.toFixed(1)} km</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Estimated Earnings:</Text>
                            <Text style={styles.earningsValue}>₹{request.estimatedCost}</Text>
                        </View>
                        <View style={styles.requirementsBox}>
                            <Text style={styles.requirementsLabel}>Requirements:</Text>
                            <Text style={styles.requirementsText}>{request.requirements}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={onReject}
                        >
                            <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={onAccept}
                        >
                            <Text style={styles.acceptButtonText}>Accept & Navigate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 20,
        maxHeight: Dimensions.get('window').height * 0.85,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#ef4444',
        fontWeight: '600',
    },
    mapContainer: {
        height: 200,
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    details: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
    },
    earningsValue: {
        fontSize: 16,
        color: '#059669',
        fontWeight: 'bold',
    },
    requirementsBox: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    requirementsLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    requirementsText: {
        fontSize: 14,
        color: '#1f2937',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    acceptButton: {
        backgroundColor: '#0d9488',
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
