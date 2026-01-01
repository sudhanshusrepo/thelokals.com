import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface PINEntryModalProps {
    visible: boolean;
    bookingId: string;
    onVerify: (pin: string) => Promise<boolean>;
    onClose: () => void;
}

export const PINEntryModal: React.FC<PINEntryModalProps> = ({
    visible,
    bookingId,
    onVerify,
    onClose
}) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const inputRefs = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const successScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Auto-focus first input when modal opens
            setTimeout(() => inputRefs[0].current?.focus(), 100);
            // Reset state
            setPin(['', '', '', '']);
            setError('');
            setSuccess(false);
        }
    }, [visible]);

    const handlePinChange = (value: string, index: number) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError('');

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }

        // Auto-verify when all 4 digits entered
        if (index === 3 && value) {
            const fullPin = newPin.join('');
            verifyPin(fullPin);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const verifyPin = async (enteredPin: string) => {
        setIsVerifying(true);
        setError('');

        try {
            const isValid = await onVerify(enteredPin);

            if (isValid) {
                setSuccess(true);
                // Success animation
                Animated.spring(successScale, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }).start();

                // Close modal after success animation
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError('Invalid PIN. Please try again.');
                setPin(['', '', '', '']);
                inputRefs[0].current?.focus();

                // Shake animation
                Animated.sequence([
                    Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
                ]).start();
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
            setPin(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleManualVerify = () => {
        const fullPin = pin.join('');
        if (fullPin.length === 4) {
            verifyPin(fullPin);
        }
    };

    if (success) {
        return (
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.successContainer,
                            { transform: [{ scale: successScale }] }
                        ]}
                    >
                        <View style={styles.successIcon}>
                            <Text style={styles.successIconText}>✓</Text>
                        </View>
                        <Text style={styles.successTitle}>PIN Verified!</Text>
                        <Text style={styles.successSubtitle}>Starting service...</Text>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Enter Client PIN</Text>
                        <Text style={styles.subtitle}>
                            Ask the client for their 4-digit PIN to start the service
                        </Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.pinContainer,
                            { transform: [{ translateX: shakeAnimation }] }
                        ]}
                    >
                        {pin.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                style={[
                                    styles.pinInput,
                                    digit ? styles.pinInputFilled : null,
                                    error ? styles.pinInputError : null
                                ]}
                                value={digit}
                                onChangeText={(value) => handlePinChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!isVerifying}
                            />
                        ))}
                    </Animated.View>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={isVerifying}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.verifyButton,
                                (pin.join('').length !== 4 || isVerifying) && styles.verifyButtonDisabled
                            ]}
                            onPress={handleManualVerify}
                            disabled={pin.join('').length !== 4 || isVerifying}
                        >
                            <Text style={styles.verifyButtonText}>
                                {isVerifying ? 'Verifying...' : 'Verify PIN'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.helpText}>
                        💡 The client will show you their PIN on their screen
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    pinInput: {
        width: 60,
        height: 70,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 12,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1f2937',
        backgroundColor: '#f9fafb',
    },
    pinInputFilled: {
        borderColor: '#0d9488',
        backgroundColor: '#f0fdfa',
    },
    pinInputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    verifyButton: {
        backgroundColor: '#0d9488',
    },
    verifyButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    helpText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    successContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    successIconText: {
        fontSize: 48,
        color: '#fff',
        fontWeight: 'bold',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
});
