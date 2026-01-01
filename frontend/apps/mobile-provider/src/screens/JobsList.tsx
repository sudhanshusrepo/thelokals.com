import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

export const JobsListScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Jobs List</Text>
                <Text>Tabs: Available | Accepted | Completed</Text>
                {/* Implementation Pending */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    }
});
