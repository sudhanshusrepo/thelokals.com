import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeSearchProps {
    onSearch: (text: string) => void;
    onMicPress: () => void;
    onCameraPress: () => void;
}

export const HomeSearch: React.FC<HomeSearchProps> = ({ onSearch, onMicPress, onCameraPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                {/* Search Icon */}
                <FontAwesome name="search" size={18} color={Colors.slate[400]} style={styles.searchIcon} />

                {/* Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Search for a service or issue..."
                    placeholderTextColor={Colors.slate[400]}
                    onSubmitEditing={(e) => onSearch(e.nativeEvent.text)}
                />

                {/* Action Icons */}
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onMicPress} style={styles.iconButton}>
                        <FontAwesome name="microphone" size={18} color={Colors.teal.DEFAULT} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity onPress={onCameraPress} style={styles.iconButton}>
                        <FontAwesome name="camera" size={18} color={Colors.teal.DEFAULT} />
                    </TouchableOpacity>
                </View>

                {/* Lokals AI Badge */}
                <View style={styles.aiBadgeContainer}>
                    <LinearGradient
                        colors={[Colors.teal.light, Colors.teal.DEFAULT]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiBadge}
                    >
                        <FontAwesome name="magic" size={10} color="white" style={{ marginRight: 4 }} />
                        <Text style={styles.aiBadgeText}>Lokals AI</Text>
                    </LinearGradient>
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: -30, // Overlap the Hero
        zIndex: 20,
        paddingHorizontal: 20,
    },
    searchBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 30,
        height: 60,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: Colors.slate[900],
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: Colors.slate[200],
        marginHorizontal: 4,
    },
    aiBadgeContainer: {
        position: 'absolute',
        top: -12,
        right: 20,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    aiBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
