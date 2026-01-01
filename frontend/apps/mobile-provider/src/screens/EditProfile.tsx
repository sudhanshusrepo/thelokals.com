import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PROVIDER_V2_TOKENS } from '@lokals/design-system';

export const EditProfileScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('Sudhanshu Verma');
    const [bio, setBio] = useState('Professional home service provider with 5 years of experience.');

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.photoSection}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>SV</Text>
                    <View style={styles.editIconBadge}>
                        <Text style={{ fontSize: 12 }}>📷</Text>
                    </View>
                </View>
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    content: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    backText: {
        fontSize: 16,
        color: '#666',
    },
    saveText: {
        fontSize: 16,
        color: '#FC574E', // Brand color
        fontWeight: '700',
    },
    photoSection: {
        alignItems: 'center',
        padding: 24,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#666',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    changePhotoText: {
        color: '#FC574E',
        fontWeight: '600',
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
    }
});
