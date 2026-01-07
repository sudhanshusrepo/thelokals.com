import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView } from 'react-native';
import { useAuth, customerService } from '@thelocals/platform-core';
import { LogOut, User, Mail, Phone, Save } from 'lucide-react-native';

export const ProfileScreen = () => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile?.name || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!user) return;
            // Assuming customerService has updateCustomerProfile and user.id matches customer id
            await customerService.updateCustomerProfile(user.id, { name: name });
            await refreshProfile();
            setIsEditing(false);
            Alert.alert("Success", "Profile updated!");
        } catch (error: any) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white pt-12">
            <View className="items-center mb-8 px-4">
                <Image
                    source={{ uri: 'https://ui-avatars.com/api/?name=' + (profile?.name || 'User') + '&background=random' }}
                    className="w-24 h-24 rounded-full mb-4"
                />
                {!isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Text className="text-2xl font-bold">{profile?.name || 'Guest User'}</Text>
                        <Text className="text-blue-600 text-sm mt-1">Edit Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="text-xl font-bold border-b border-blue-500 pb-1 min-w-[150px] text-center"
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleSave} className="ml-3 bg-blue-100 p-2 rounded-full">
                            <Save size={18} color="#2563EB" {...({} as any)} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 px-6">
                <View className="mb-6">
                    <Text className="text-gray-500 text-sm mb-2 uppercase tracking-wide">Contact Info</Text>

                    <View className="flex-row items-center py-3 border-b border-gray-100">
                        <Phone size={20} color="#6B7280" {...({} as any)} />
                        <Text className="ml-3 text-gray-800 text-lg">{user?.phone || 'No phone'}</Text>
                    </View>

                    <View className="flex-row items-center py-3 border-b border-gray-100">
                        <Mail size={20} color="#6B7280" {...({} as any)} />
                        <Text className="ml-3 text-gray-800 text-lg">{user?.email || 'No email'}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    className="flex-row items-center py-4 border-t border-gray-100 mt-4"
                    onPress={() => signOut()}
                >
                    <LogOut size={20} color="#EF4444" {...({} as any)} />
                    <Text className="ml-3 text-red-500 font-semibold text-lg">Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
