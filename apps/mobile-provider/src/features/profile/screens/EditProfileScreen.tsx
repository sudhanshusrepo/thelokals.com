import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, ProfileFormValues, useAuth, providerService, supabase } from '@thelocals/platform-core';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const EditProfileScreen = () => {
    const { profile, refreshProfile } = useAuth();
    const navigation = useNavigation();
    const [uploading, setUploading] = useState(false);

    const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: profile?.name || '',
            description: profile?.description || '',
            price: profile?.price || 0,
            imageUrl: profile?.imageUrl || '',
            category: (profile as any)?.category || '',
            // Bank details would go here if we were editing them in same form, but let's keep it simple
        }
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);
            const ext = uri.substring(uri.lastIndexOf('.') + 1);
            const fileName = `${profile?.id}/${Date.now()}.${ext}`;
            const formData = new FormData();

            // React Native needs specific object for file upload
            formData.append('file', {
                uri,
                name: fileName,
                type: `image/${ext}`
            } as any);

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, formData, { upsert: true });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setValue('imageUrl', publicUrl);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Upload Failed", e.message);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            if (!profile?.id) return;
            // platform-core typescript might complain about ProfileFormValues vs WorkerProfile partial
            // We need to map it manually or fix types.
            const updates: any = {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                imageUrl: data.imageUrl,
                category: data.category,
            };

            await providerService.updateProfile(profile.id, updates);
            await refreshProfile();
            Alert.alert("Success", "Profile updated successfully");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to update profile");
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
            </View>

            <ScrollView className="flex-1 px-5 py-4">
                {/* Image Picker */}
                <View className="items-center mb-8">
                    <Controller
                        control={control}
                        name="imageUrl"
                        render={({ field: { value } }) => (
                            <TouchableOpacity onPress={pickImage} className="relative">
                                <Image
                                    source={{ uri: value || `https://ui-avatars.com/api/?name=${profile?.name}` }}
                                    className="w-28 h-28 rounded-full bg-gray-200"
                                />
                                <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white">
                                    {uploading ? <ActivityIndicator size="small" color="white" /> : <Camera size={16} color="white" />}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Form Fields */}
                <View className="gap-5 mb-10">
                    <View>
                        <Text className="font-medium text-gray-700 mb-1">Full Name</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 text-gray-900 bg-gray-50"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Your Name"
                                />
                            )}
                        />
                        {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
                    </View>

                    <View>
                        <Text className="font-medium text-gray-700 mb-1">Service Category</Text>
                        <Controller
                            control={control}
                            name="category"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 text-gray-900 bg-gray-50"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="e.g. Plumber"
                                />
                            )}
                        />
                        {errors.category && <Text className="text-red-500 text-xs mt-1">{errors.category.message}</Text>}
                    </View>

                    <View>
                        <Text className="font-medium text-gray-700 mb-1">Hourly Rate ($)</Text>
                        <Controller
                            control={control}
                            name="price"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 text-gray-900 bg-gray-50"
                                    onBlur={onBlur}
                                    onChangeText={(text) => onChange(Number(text))}
                                    value={String(value || '')}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                />
                            )}
                        />
                    </View>

                    <View>
                        <Text className="font-medium text-gray-700 mb-1">Bio / Description</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-3 text-gray-900 bg-gray-50 h-32"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    multiline
                                    textAlignVertical="top"
                                    placeholder="Tell customers about your experience..."
                                />
                            )}
                        />
                    </View>
                </View>
            </ScrollView>

            <View className="p-4 border-t border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting || uploading}
                    className={`rounded-xl py-4 items-center ${isSubmitting || uploading ? 'bg-gray-300' : 'bg-blue-600'}`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
