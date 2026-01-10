import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useBookingLogic, PricingUtils } from '@thelocals/flows';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';

const PulseCircle = ({ delay }: { delay: number }) => {
    const scale = React.useRef(new Animated.Value(1)).current;
    const opacity = React.useRef(new Animated.Value(0.5)).current;

    React.useEffect(() => {
        const animation = Animated.loop(
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 2.5,
                    duration: 2000,
                    delay,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 2000,
                    delay,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [delay, scale, opacity]);

    return (
        <Animated.View
            className="absolute bg-green-500 rounded-full w-full h-full"
            style={{
                transform: [{ scale }],
                opacity,
                width: '100%',
                height: '100%'
            }}
        />
    );
};

export const LiveBookingHub = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { initialContext } = route.params || {};

    const { state, context, send } = useBookingLogic('DRAFT', initialContext);
    const [userLocation, setUserLocation] = useState<any>(null);

    const isSearching = state === 'SEARCHING' || state === 'REQUESTING';
    const isAssigned = state === 'CONFIRMED' || state === 'EN_ROUTE' || state === 'IN_PROGRESS';

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        })();
    }, []);

    const handleConfirmBooking = () => {
        send('SUBMIT_LIVE');
        // Mock finding provider
        setTimeout(() => {
            send('PROVIDER_FOUND', {
                provider: {
                    providerId: 'p1',
                    name: 'Rajesh Kumar',
                    rating: 4.8,
                    location: { lat: 19.0760, lng: 72.8777 } as any, // Mock
                    imageUrl: '',
                    services: [],
                    isOnline: true
                }
            });
        }, 3000);
    };

    return (
        <View className="flex-1 bg-white">
            <MapView
                provider={PROVIDER_DEFAULT}
                style={{ width: '100%', height: '100%' }}
                region={userLocation}
                showsUserLocation={true}
            >
                {/* Provider Marker */}
                {isAssigned && context.provider && (
                    <Marker
                        coordinate={{
                            latitude: (context.provider as any).location.lat,
                            longitude: (context.provider as any).location.lng
                        }}
                        title={context.provider.name}
                    />
                )}
            </MapView>

            <SafeAreaView className="absolute top-0 left-0 right-0 p-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom Sheet */}
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl p-6 pb-10">

                {/* PRE-BOOKING */}
                {(state === 'DRAFT' || state === 'ESTIMATING') && (
                    <View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
                                <Text className="text-2xl">🛠️</Text>
                            </View>
                            <View>
                                <Text className="font-bold text-lg text-gray-900">{context.selectedOption?.name || 'Service'}</Text>
                                <Text className="text-gray-500">{PricingUtils.formatPrice(context.price || 0)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleConfirmBooking}
                            className="bg-black py-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold text-lg">Find Provider Now</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* SEARCHING */}
                {isSearching && (
                    <View className="items-center py-8">
                        <View className="items-center justify-center mb-6 h-24 w-24">
                            {/* Pulse Circles */}
                            <PulseCircle delay={0} />
                            <PulseCircle delay={500} />

                            <View className="bg-white p-3 rounded-full shadow-sm z-10">
                                <ActivityIndicator size="small" color="#10B981" />
                            </View>
                        </View>
                        <Text className="text-lg font-bold mt-2 text-gray-900">Finding nearby pros...</Text>
                        <Text className="text-gray-500 mb-6 text-center">Connecting with the best rated providers{'\n'}in your area.</Text>

                        <TouchableOpacity
                            onPress={() => send('CANCEL')}
                            className="bg-gray-100 px-6 py-2 rounded-full"
                        >
                            <Text className="text-gray-600 font-bold text-sm">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ASSIGNED */}
                {isAssigned && context.provider && (
                    <View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-green-600 font-bold uppercase text-xs">Provider Arriving</Text>
                            <Text className="text-gray-900 font-bold">12 mins</Text>
                        </View>
                        <Text className="text-xl font-bold text-gray-900 mb-4">Rajesh is on the way</Text>

                        <View className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-4">
                            <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
                                <Text className="text-lg">👨‍🔧</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-900">{context.provider.name}</Text>
                                <Text className="text-gray-500 text-xs">⭐ {context.provider.rating} Rating</Text>
                            </View>
                            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 mr-2">
                                <Ionicons name="call" size={20} color="green" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => send('CANCEL')} className="border border-gray-200 py-3 rounded-xl items-center">
                            <Text className="text-gray-500 font-bold">Cancel Booking</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};
