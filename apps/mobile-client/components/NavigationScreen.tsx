import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

interface NavigationScreenProps {
    bookingId: string;
    clientLocation: {
        lat: number;
        lng: number;
    };
    clientName: string;
    clientPhone?: string;
    onArrived: () => void;
    onCancel: () => void;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({
    bookingId,
    clientLocation,
    clientName,
    clientPhone,
    onArrived,
    onCancel
}) => {
    const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isTracking, setIsTracking] = useState(true);

    // Google Maps API key - should be in environment variables
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required for navigation');
                    return;
                }

                // Get initial location
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });

                setProviderLocation({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                });

                // Start watching location
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000, // Update every 5 seconds
                        distanceInterval: 10 // Or every 10 meters
                    },
                    (newLocation) => {
                        setProviderLocation({
                            lat: newLocation.coords.latitude,
                            lng: newLocation.coords.longitude
                        });
                    }
                );
            } catch (error) {
                console.error('Error starting location tracking:', error);
                Alert.alert('Error', 'Failed to start location tracking');
            }
        };

        if (isTracking) {
            startTracking();
        }

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isTracking]);

    const handleCallClient = () => {
        if (clientPhone) {
            Linking.openURL(`tel:${clientPhone}`);
        } else {
            Alert.alert('No Phone Number', 'Client phone number not available');
        }
    };

    const handleOpenMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${clientLocation.lat},${clientLocation.lng}`;
        Linking.openURL(url);
    };

    const region = providerLocation ? {
        latitude: (providerLocation.lat + clientLocation.lat) / 2,
        longitude: (providerLocation.lng + clientLocation.lng) / 2,
        latitudeDelta: Math.abs(providerLocation.lat - clientLocation.lat) * 2.5 || 0.05,
        longitudeDelta: Math.abs(providerLocation.lng - clientLocation.lng) * 2.5 || 0.05,
    } : {
        latitude: clientLocation.lat,
        longitude: clientLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followsUserLocation={true}
            >
                {/* Client Location Marker */}
                <Marker
                    coordinate={{
                        latitude: clientLocation.lat,
                        longitude: clientLocation.lng
                    }}
                    title={clientName}
                    description="Client Location"
                    pinColor="red"
                />

                {/* Provider Location Marker */}
                {providerLocation && (
                    <Marker
                        coordinate={{
                            latitude: providerLocation.lat,
                            longitude: providerLocation.lng
                        }}
                        title="You"
                        description="Your Location"
                        pinColor="blue"
                    />
                )}

                {/* Directions */}
                {providerLocation && GOOGLE_MAPS_API_KEY && (
                    <MapViewDirections
                        origin={{
                            latitude: providerLocation.lat,
                            longitude: providerLocation.lng
                        }}
                        destination={{
                            latitude: clientLocation.lat,
                            longitude: clientLocation.lng
                        }}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor="#0d9488"
                        onReady={(result) => {
                            setDistance(result.distance);
                            setDuration(result.duration);
                        }}
                    />
                )}
            </MapView>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                    <View>
                        <Text style={styles.clientName}>{clientName}</Text>
                        <Text style={styles.infoSubtext}>Navigating to client</Text>
                    </View>
                    {duration > 0 && (
                        <View style={styles.etaContainer}>
                            <Text style={styles.etaLabel}>ETA</Text>
                            <Text style={styles.etaValue}>{Math.round(duration)} min</Text>
                        </View>
                    )}
                </View>

                {distance > 0 && (
                    <Text style={styles.distanceText}>
                        {distance.toFixed(1)} km away
                    </Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleCallClient}
                    >
                        <Text style={styles.secondaryButtonText}>📞 Call Client</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleOpenMaps}
                    >
                        <Text style={styles.secondaryButtonText}>🗺️ Open Maps</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={onArrived}
                >
                    <Text style={styles.primaryButtonText}>I've Arrived</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                >
                    <Text style={styles.cancelButtonText}>Cancel Navigation</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    infoCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    clientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    infoSubtext: {
        fontSize: 14,
        color: '#6b7280',
    },
    etaContainer: {
        alignItems: 'center',
        backgroundColor: '#0d9488',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    etaLabel: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    etaValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    distanceText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#0d9488',
        marginBottom: 8,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    },
});
