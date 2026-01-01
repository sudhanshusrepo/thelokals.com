import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { PROVIDER_V2_TOKENS } from '@lokals/design-system';

export const OfflineBanner = () => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected !== false) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>No Internet Connection</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: PROVIDER_V2_TOKENS.colors.accentDanger,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
});
