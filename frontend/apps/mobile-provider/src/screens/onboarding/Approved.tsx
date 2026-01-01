import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type ApprovedNavProp = StackNavigationProp<RootStackParamList>;

export default function ApprovedScreen() {
    const navigation = useNavigation<ApprovedNavProp>();

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <View style={{
                width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5',
                justifyContent: 'center', alignItems: 'center', marginBottom: 24
            }}>
                <Text style={{ fontSize: 40 }}>✅</Text>
            </View>

            <Text style={{ fontSize: 24, fontWeight: '700', color: '#0E121A', marginBottom: 12 }}>
                Welcome to lokals!
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 }}>
                You're live now. Start accepting jobs and earning.
            </Text>

            <TouchableOpacity
                style={{
                    backgroundColor: '#0E121A',
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 16
                }}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }}
            >
                <Text style={{ fontSize: 16, color: '#FFF', fontWeight: 'bold' }}>Start Accepting Jobs</Text>
            </TouchableOpacity>
        </View>
    );
}
