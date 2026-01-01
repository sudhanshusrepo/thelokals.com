import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface LocationData {
    coords: {
        latitude: number;
        longitude: number;
    };
    city?: string | null;
    subregion?: string | null;
    formattedAddress?: string | null;
}

interface LocationContextType {
    location: LocationData | null;
    errorMsg: string | null;
    isLoading: boolean;
    requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
    location: null,
    errorMsg: null,
    isLoading: false,
    requestLocation: async () => { },
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Try to load cached location on mount
        loadCachedLocation();
    }, []);

    const loadCachedLocation = async () => {
        try {
            const cached = await SecureStore.getItemAsync('user_location');
            if (cached) {
                setLocation(JSON.parse(cached));
            }
        } catch (e) {
            console.log('Error loading cached location:', e);
        }
    };

    const requestLocation = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setIsLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let reverseCode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            const locationData: LocationData = {
                coords: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                city: reverseCode[0]?.city,
                subregion: reverseCode[0]?.subregion,
                formattedAddress: `${reverseCode[0]?.city}, ${reverseCode[0]?.region}`,
            };

            setLocation(locationData);
            await SecureStore.setItemAsync('user_location', JSON.stringify(locationData));

        } catch (error) {
            console.error("Error fetching location", error);
            setErrorMsg('Could not fetch location');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocationContext.Provider value={{ location, errorMsg, isLoading, requestLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
