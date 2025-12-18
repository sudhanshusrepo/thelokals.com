import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    ConfirmationResult,
    ApplicationVerifier
} from 'firebase/auth';

// Helper to get env vars safely in both Vite and Next.js environments
const getEnv = (key: string) => {
    // Safe check for import.meta.env or process.env
    const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : (typeof process !== 'undefined' ? process.env : {});
    return env[key] || '';
};

// Firebase configuration
const firebaseConfig = {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.appId
    );
};

/**
 * Initialize Firebase app
 */
export const initializeFirebase = (): FirebaseApp => {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured. Please set Firebase environment variables.');
    }

    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    }
    return app;
};

/**
 * Get Firebase Auth instance
 */
export const getFirebaseAuth = (): Auth => {
    if (!auth) {
        initializeFirebase();
    }
    return auth!;
};

/**
 * Initialize RecaptchaVerifier for phone authentication
 * @param containerId - ID of the HTML element to render the reCAPTCHA
 * @param size - Size of the reCAPTCHA widget ('normal' or 'invisible')
 */
export const initializeRecaptcha = (
    containerId: string,
    size: 'normal' | 'invisible' = 'invisible'
): RecaptchaVerifier => {
    const authInstance = getFirebaseAuth();

    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
    }

    recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
        size,
        callback: () => {
            // reCAPTCHA solved

        },
        'expired-callback': () => {
            // Response expired

        },
    });

    return recaptchaVerifier;
};

/**
 * Send OTP to phone number
 * @param phoneNumber - Phone number in E.164 format (e.g., +919876543210)
 * @param appVerifier - RecaptchaVerifier instance
 */
export const sendPhoneOTP = async (
    phoneNumber: string,
    appVerifier: ApplicationVerifier
): Promise<ConfirmationResult> => {
    const authInstance = getFirebaseAuth();

    try {
        const confirmationResult = await signInWithPhoneNumber(
            authInstance,
            phoneNumber,
            appVerifier
        );
        return confirmationResult;
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        throw new Error(error.message || 'Failed to send OTP');
    }
};

/**
 * Verify OTP code
 * @param confirmationResult - Result from sendPhoneOTP
 * @param code - OTP code entered by user
 */
export const verifyPhoneOTP = async (
    confirmationResult: ConfirmationResult,
    code: string
): Promise<string> => {
    try {
        const result = await confirmationResult.confirm(code);
        const idToken = await result.user.getIdToken();
        return idToken;
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        throw new Error(error.message || 'Invalid OTP code');
    }
};

/**
 * Clean up RecaptchaVerifier
 */
export const cleanupRecaptcha = () => {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
    }
};
