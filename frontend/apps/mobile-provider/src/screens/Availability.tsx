import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';

export const AvailabilityScreen = () => {
    const [services, setServices] = useState<Record<string, boolean>>({
        cleaning: true,
        plumbing: true,
        electrical: false,
        beauty: true,
        appliances: false
    });
    const [radius, setRadius] = useState(10);
    const [availableNow, setAvailableNow] = useState(true);

    const serviceOptions = [
        { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
        { id: 'plumbing', label: 'Plumbing', icon: '🚿' },
        { id: 'electrical', label: 'Electrical', icon: '🔌' },
        { id: 'beauty', label: 'Beauty', icon: '💅' },
        { id: 'appliances', label: 'Appliances', icon: '🧰' }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={{ paddingTop: 20, padding: 20 }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#0E121A' }}>
                        Availability
                    </Text>

                    {/* Available Now Toggle */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setAvailableNow(!availableNow)}
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 16,
                            elevation: 8
                        }}
                    >
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0E121A' }}>Available now</Text>
                            <Text style={{ fontSize: 14, color: '#666' }}>
                                Jobs appear immediately
                            </Text>
                        </View>
                        <View style={{
                            width: 48,
                            height: 28,
                            backgroundColor: availableNow ? '#8AE98D' : '#E0E0E0',
                            borderRadius: 14,
                            justifyContent: 'center',
                            paddingLeft: 4,
                            paddingRight: availableNow ? 4 : 20
                        }}>
                            <View style={{
                                width: 20,
                                height: 20,
                                backgroundColor: 'white',
                                borderRadius: 10,
                                alignSelf: availableNow ? 'flex-end' : 'flex-start'
                            }} />
                        </View>
                    </TouchableOpacity>

                    {/* Service Badges */}
                    <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#0E121A' }}>
                        Services offered
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32 }}>
                        {serviceOptions.map(service => (
                            <TouchableOpacity
                                key={service.id}
                                onPress={() => setServices({ ...services, [service.id]: !services[service.id] })}
                                style={{
                                    backgroundColor: services[service.id] ? '#F7C846' : 'white',
                                    paddingHorizontal: 20,
                                    paddingVertical: 12,
                                    borderRadius: 20,
                                    marginRight: 12,
                                    marginBottom: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 4
                                }}
                            >
                                <Text style={{ fontSize: 20, marginRight: 8 }}>{service.icon}</Text>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: services[service.id] ? '700' : '500',
                                    color: services[service.id] ? '#0E121A' : '#666'
                                }}>
                                    {service.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Radius Slider */}
                    <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#0E121A' }}>
                        Service radius
                    </Text>
                    <View style={{
                        backgroundColor: 'white',
                        padding: 24,
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                        elevation: 8,
                        marginBottom: 32
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#0E121A' }}>
                            {radius}km
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ fontSize: 14, color: '#666' }}>5km</Text>
                            <Text style={{ fontSize: 14, color: '#666' }}>15km</Text>
                        </View>
                        {/* Slider implementation */}
                        <View style={{
                            height: 6,
                            backgroundColor: '#E0E0E0',
                            borderRadius: 3,
                            flexDirection: 'row',
                            overflow: 'hidden' // Ensure color stays within bounds
                        }}>
                            <View style={{
                                width: `${(radius - 5) * 10}%`, // Simplified scale for 5-15 (range 10)
                                height: 6,
                                backgroundColor: '#F7C846',
                                borderRadius: 3
                            }} />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={{
                        backgroundColor: '#FC574E',
                        padding: 20,
                        borderRadius: 20,
                        alignItems: 'center',
                        shadowColor: '#FC574E',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 12
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                            Save availability
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingBottom: 40,
    }
});
