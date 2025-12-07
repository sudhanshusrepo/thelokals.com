import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    PhoneAuthProvider,
    signInWithCredential,
    UserCredential
} from 'firebase/auth';

// Firebase configuration type
export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

// Phone auth result type
export interface PhoneAuthResult {
    verificationId: string;
    confirmationResult: ConfirmationResult;
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

/**
 * Initialize Firebase with environment configuration
 */
export const initFirebase = (): Auth => {
    if (firebaseAuth) {
        return firebaseAuth;
    }

    const config: FirebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };

    // Validate configuration
    if (!config.apiKey || !config.projectId) {
        throw new Error('Firebase configuration is incomplete. Please check environment variables.');
    }

    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);

    return firebaseAuth;
};

/**
 * Get Firebase Auth instance (initializes if not already done)
 */
export const getFirebaseAuth = (): Auth => {
    if (!firebaseAuth) {
        return initFirebase();
    }
    return firebaseAuth;
};

/**
 * Setup reCAPTCHA verifier for phone authentication
 */
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    const auth = getFirebaseAuth();

    return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber
            console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
            console.error('reCAPTCHA expired');
        }
    });
};

/**
 * Send OTP to phone number
 */
export const sendPhoneOTP = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
    const auth = getFirebaseAuth();

    try {
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            recaptchaVerifier
        );

        return confirmationResult;
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        throw new Error(error.message || 'Failed to send OTP');
    }
};

/**
 * Verify OTP code
 */
export const verifyPhoneOTP = async (
    confirmationResult: ConfirmationResult,
    code: string
): Promise<UserCredential> => {
    try {
        const result = await confirmationResult.confirm(code);
        return result;
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        throw new Error(error.message || 'Invalid OTP code');
    }
};

/**
 * Format phone number to E.164 format
 * Example: +919876543210
 */
export const formatPhoneNumber = (phoneNumber: string, countryCode: string = '+91'): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If already has country code, return as is
    if (cleaned.startsWith(countryCode.replace('+', ''))) {
        return `+${cleaned}`;
    }

    // Add country code
    return `${countryCode}${cleaned}`;
};

/**
 * Check if Firebase Auth is enabled
 */
export const isFirebaseAuthEnabled = (): boolean => {
    return import.meta.env.VITE_ENABLE_FIREBASE_AUTH === 'true';
};

/**
 * Sign out from Firebase
 */
export const signOutFirebase = async (): Promise<void> => {
    const auth = getFirebaseAuth();
    await auth.signOut();
};

export default {
    initFirebase,
    getFirebaseAuth,
    setupRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    formatPhoneNumber,
    isFirebaseAuthEnabled,
    signOutFirebase
};
