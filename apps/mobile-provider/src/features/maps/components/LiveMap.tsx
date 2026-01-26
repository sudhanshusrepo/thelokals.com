import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Coordinates } from '@thelocals/platform-core';
import { MapPin, Navigation } from 'lucide-react-native';

interface LiveMapProps {
    destination: Coordinates;
    providerLocation?: Coordinates;
    height?: number;
    showNavigation?: boolean;
    onNavigationStart?: () => void;
}

const { width } = Dimensions.get('window');

export const LiveMap = ({
    destination,
    providerLocation,
    height = 200,
    showNavigation = false,
    onNavigationStart
}: LiveMapProps) => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    // Default region (fallback to destination)
    const initialRegion = {
        latitude: destination?.lat || 37.78825,
        longitude: destination?.lng || -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
    };

    if (!destination?.lat || !destination?.lng) {
        return (
            <View className="bg-gray-100 justify-center items-center rounded-xl" style={{ height }}>
                <MapPin size={32} color="#9CA3AF" />
                <Text className="text-gray-400 mt-2">No location data</Text>
            </View>
        );
    }

    return (
        <View style={{ height, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
            <MapView
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_DEFAULT} // Use default (Apple/Google) to avoid API key setup for dev if possible, or PROVIDER_GOOGLE
                initialRegion={initialRegion}
                region={{
                    latitude: destination.lat,
                    longitude: destination.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{ latitude: destination.lat, longitude: destination.lng }}
                    title="Job Location"
                    description="Customer Address"
                    pinColor="red"
                />

                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        title="You"
                        pinColor="blue"
                    />
                )}
            </MapView>

            {showNavigation && (
                <TouchableOpacity
                    onPress={onNavigationStart}
                    className="absolute bottom-3 right-3 bg-blue-600 p-3 rounded-full shadow-lg items-center justify-center flex-row gap-2"
                >
                    <Navigation size={20} color="white" />
                    <Text className="text-white font-bold text-xs">Navigate</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
