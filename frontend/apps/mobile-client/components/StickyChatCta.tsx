import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

interface StickyChatCtaProps {
    isVisible: boolean;
    onSend: (content: { type: 'text' | 'audio' | 'video', data: string | any }) => void;
    placeholder?: string;
}

export const StickyChatCta: React.FC<StickyChatCtaProps> = ({ isVisible, onSend, placeholder = "Ask our AI to find a professional..." }) => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const slideAnim = useRef(new Animated.Value(100)).current; // Start hidden (below screen)

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : 100,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isVisible]);

    const handleSendText = () => {
        if (text.trim()) {
            onSend({ type: 'text', data: text });
            setText('');
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setIsRecording(true);
            } else {
                Alert.alert("Permission required", "Please grant microphone permission to record audio.");
            }
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert("Error", "Failed to start recording.");
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (uri) {
                // In a real app, you might upload this file here
                onSend({ type: 'audio', data: uri });
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    };

    const handleVideo = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert("Permission required", "Please grant camera permission to record video.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 1,
                videoMaxDuration: 60,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onSend({ type: 'video', data: result.assets[0].uri });
            }
        } catch (error) {
            console.error("Error picking video:", error);
            Alert.alert("Error", "Failed to record video.");
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.mediaButtons}>
                        <TouchableOpacity
                            style={[styles.iconButton, isRecording && styles.recordingButton]}
                            onPress={isRecording ? stopRecording : startRecording}
                        >
                            {isRecording ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <FontAwesome name="microphone" size={20} color={Colors.slate[500]} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={handleVideo} disabled={isRecording}>
                            <FontAwesome name="video-camera" size={20} color={isRecording ? Colors.slate[300] : Colors.slate[500]} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder={isRecording ? "Recording audio..." : placeholder}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={200}
                        editable={!isRecording}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, (!text.trim() && !isRecording) && styles.sendButtonDisabled]}
                        onPress={handleSendText}
                        disabled={!text.trim() || isRecording}
                    >
                        <FontAwesome name="paper-plane" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: Colors.slate[200],
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 4,
        paddingBottom: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.slate[100],
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingButton: {
        backgroundColor: Colors.red.DEFAULT,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.slate[100],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        minHeight: 40,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.teal.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.slate[300],
    },
});
