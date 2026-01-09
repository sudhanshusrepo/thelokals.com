import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView } from 'react-native';
import { LogOut, User, Mail, Phone, Save } from 'lucide-react-native';
import { useAuth, customerService } from '@thelocals/platform-core';
import { Surface, Section, colors, spacing } from '@thelocals/ui-mobile';

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
        <View style={{ flex: 1, backgroundColor: colors.backgroundBase, paddingTop: 48 }}>
            <View className="items-center mb-8 px-4">
                <Image
                    source={{ uri: 'https://ui-avatars.com/api/?name=' + (profile?.name || 'User') + '&background=random' }}
                    className="w-24 h-24 rounded-full mb-4"
                />
                {!isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                        <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{profile?.name || 'Guest User'}</Text>
                        <Text style={{ color: colors.primary, marginTop: 4 }}>Edit Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="text-xl font-bold border-b pb-1 min-w-[150px] text-center"
                            style={{ borderColor: colors.primary, color: colors.textPrimary }}
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleSave} className="ml-3 bg-blue-100 p-2 rounded-full">
                            <Save size={18} color={colors.primary} {...({} as any)} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 px-6">
                <Section>
                    <Surface elevated padding="lg">
                        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 }}>Contact Info</Text>

                        <View className="flex-row items-center py-3 border-b" style={{ borderColor: colors.borderSubtle }}>
                            <Phone size={20} color={colors.textSecondary} {...({} as any)} />
                            <Text className="ml-3 text-lg" style={{ color: colors.textPrimary }}>{user?.phone || 'No phone'}</Text>
                        </View>

                        <View className="flex-row items-center py-3">
                            <Mail size={20} color={colors.textSecondary} {...({} as any)} />
                            <Text className="ml-3 text-lg" style={{ color: colors.textPrimary }}>{user?.email || 'No email'}</Text>
                        </View>
                    </Surface>
                </Section>

                <Section>
                    <Surface elevated padding="lg">
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-2"
                            onPress={() => signOut()}
                        >
                            <LogOut size={20} color="#EF4444" {...({} as any)} />
                            <Text className="ml-3 text-red-500 font-semibold text-lg">Sign Out</Text>
                        </TouchableOpacity>
                    </Surface>
                </Section>
            </ScrollView>
        </View>
    );
};
