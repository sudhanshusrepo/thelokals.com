import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEY = 'lokals_user_location_v2';
const DEFAULT_CITY = 'Mumbai';

export interface LocationState {
    status: 'idle' | 'detecting' | 'resolved' | 'error';
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    city: string | null;
    source: 'auto' | 'manual';
    timestamp: number;
}

const DEFAULT_STATE: LocationState = {
    status: 'idle',
    latitude: 19.0760,
    longitude: 72.8777, // Mumbai
    address: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    source: 'manual',
    timestamp: 0
};

interface LocationContextType {
    locationState: LocationState;
    detectLocation: (force?: boolean) => Promise<void>;
    updateLocation: (lat: number, lng: number, address: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<LocationState>(DEFAULT_STATE);

    useEffect(() => {
        loadLocation();
    }, []);

    const loadLocation = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Check freshness (e.g. 24h)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setState(parsed);
                    return;
                }
            }
            // If no valid cache, detect automatically
            detectLocation();
        } catch (error) {
            console.error('Failed to load location', error);
            detectLocation(); // Fallback
        }
    };

    const detectLocation = async (force = false) => {
        if (!force && state.status === 'resolved') return;

        setState(prev => ({ ...prev, status: 'detecting' }));

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setState(prev => ({ ...prev, status: 'error' }));
                Alert.alert('Permission Denied', 'Location permission is required to find providers near you.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const { latitude, longitude } = location.coords;

            // Reverse Geocode
            const [addressObj] = await Location.reverseGeocodeAsync({ latitude, longitude });

            let formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            let city = DEFAULT_CITY;

            if (addressObj) {
                formattedAddress = [
                    addressObj.street,
                    addressObj.city,
                    addressObj.region,
                    addressObj.postalCode
                ].filter(Boolean).join(', ');
                city = addressObj.city || addressObj.subregion || DEFAULT_CITY;
            }

            const newState: LocationState = {
                status: 'resolved',
                latitude,
                longitude,
                address: formattedAddress,
                city,
                source: 'auto',
                timestamp: Date.now()
            };

            setState(newState);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

        } catch (error) {
            console.error('Location detection failed', error);
            setState(prev => ({ ...prev, status: 'error' }));
            // Keep previous valid data or default
        }
    };

    const updateLocation = async (lat: number, lng: number, address: string) => {
        const newState: LocationState = {
            status: 'resolved',
            latitude: lat,
            longitude: lng,
            address,
            city: 'Custom', // Extracted if needed
            source: 'manual',
            timestamp: Date.now()
        };
        setState(newState);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    return (
        <LocationContext.Provider value={{ locationState: state, detectLocation, updateLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) throw new Error('useLocation must be used within LocationProvider');
    return context;
};
