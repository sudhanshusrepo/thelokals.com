import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type DigilockerIntroNavProp = StackNavigationProp<OnboardingStackParamList, 'DigilockerIntro'>;

export default function DigilockerIntroScreen() {
    const navigation = useNavigation<DigilockerIntroNavProp>();

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <LinearGradient colors={['#F7C846', '#8AE98D']} style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 32
            }}>
                <Text style={{ fontSize: 48 }}>🔒</Text>
            </LinearGradient>

            <Text style={{ fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 16, color: '#0E121A' }}>
                Verify with DigiLocker
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center', color: '#666', lineHeight: 24, marginBottom: 40 }}>
                Government verified identity. Takes 1 minute.
            </Text>

            <TouchableOpacity
                style={{
                    backgroundColor: '#FC574E',
                    paddingHorizontal: 48,
                    paddingVertical: 20,
                    borderRadius: 24,
                    marginBottom: 16,
                    shadowColor: '#FC574E',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 12
                }}
                onPress={() => navigation.navigate('DigilockerAuth')}
            >
                <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Continue with DigiLocker</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 14, color: '#999' }}>Secure • Fast • Government verified</Text>
        </View>
    );
}
