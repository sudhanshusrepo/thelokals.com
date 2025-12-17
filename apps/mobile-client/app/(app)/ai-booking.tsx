import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AiBookingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { type, data } = params;
    const [status, setStatus] = useState<'analyzing' | 'finding' | 'confirmed'>('analyzing');

    useEffect(() => {
        // Simulate AI processing
        const timer1 = setTimeout(() => {
            setStatus('finding');
        }, 2000);

        const timer2 = setTimeout(() => {
            setStatus('confirmed');
        }, 4500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const handleDone = () => {
        router.replace('/(app)/bookings');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {status === 'analyzing' && (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={Colors.teal} />
                        <Text style={styles.title}>Analyzing Request...</Text>
                        <Text style={styles.subtitle}>
                            {type === 'text' ? `"${data}"` : 'Processing media...'}
                        </Text>
                    </View>
                )}

                {status === 'finding' && (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={Colors.blue} />
                        <Text style={styles.title}>Finding Professionals...</Text>
                        <Text style={styles.subtitle}>Matching your needs with top-rated locals.</Text>
                    </View>
                )}

                {status === 'confirmed' && (
                    <View style={styles.stateContainer}>
                        <View style={styles.successIcon}>
                            <FontAwesome name="check" size={40} color="white" />
                        </View>
                        <Text style={styles.title}>Request Received!</Text>
                        <Text style={styles.subtitle}>
                            We've sent your request to 3 nearby professionals. You'll receive quotes shortly.
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Request Details</Text>
                            <Text style={styles.cardText}>Type: {type === 'text' ? 'Text Request' : type === 'audio' ? 'Voice Note' : 'Video Request'}</Text>
                            <Text style={styles.cardText}>Status: Pending Quotes</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            <Text style={styles.button} onPress={handleDone}>View Bookings</Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    stateContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.slate[500],
        textAlign: 'center',
        marginBottom: 32,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.teal,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    card: {
        backgroundColor: Colors.slate[100],
        padding: 16,
        borderRadius: 12,
        width: '100%',
        marginBottom: 24,
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 16,
    },
    cardText: {
        color: Colors.slate[600],
        marginBottom: 4,
    },
    buttonContainer: {
        width: '100%',
        backgroundColor: Colors.teal,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    button: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
