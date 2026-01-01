import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Note: Navigating to RootStack here to exit onboarding
type PendingNavProp = StackNavigationProp<RootStackParamList>;

export default function PendingApprovalScreen() {
    const navigation = useNavigation<PendingNavProp>();

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <View style={{
                width: 100, height: 100, borderRadius: 50, backgroundColor: '#FEF3C7',
                justifyContent: 'center', alignItems: 'center', marginBottom: 24
            }}>
                <Text style={{ fontSize: 40 }}>⏳</Text>
            </View>

            <Text style={{ fontSize: 24, fontWeight: '700', color: '#0E121A', marginBottom: 12 }}>
                Registration Submitted
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 }}>
                High demand in your area! Admin will review your profile in 24-48 hours.
            </Text>

            <TouchableOpacity
                onPress={() => {
                    // Forcefully navigate to Main/Dashboard to allow them to "Explore"
                    // In a real app, this might be a restricted Guest Mode
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }}
            >
                <Text style={{ fontSize: 16, color: '#FC574E', fontWeight: 'bold' }}>Explore App ➜</Text>
            </TouchableOpacity>
        </View>
    );
}
