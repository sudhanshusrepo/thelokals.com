import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase, useAuth } from '@thelocals/platform-core';

// Configure handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
    const { user } = useAuth(); // Assuming useAuth is available or passed in

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            // Handle deep linking or navigation here based on data (log moved to debug only)
            // Handle deep linking or navigation here based on data
        });

        return () => {
            if (notificationListener.current) notificationListener.current.remove();
            if (responseListener.current) responseListener.current.remove();
        };
    }, []);

    // Sync token to DB when user exists and token exists
    useEffect(() => {
        if (user && expoPushToken) {
            savePushToken(user.id, expoPushToken);
        }
    }, [user, expoPushToken]);

    const savePushToken = async (userId: string, token: string) => {
        try {
            // Check if profile exists, then update
            const { error } = await supabase
                .from('providers')
                .update({ push_token: token })
                .eq('id', userId);

            if (error) {
                // If column doesn't exist, this will fail silently in catch or log error
                // We assume 'push_token' column might need to be added manually or ignored for now.
                console.warn('Failed to save push token (column might be missing):', error.message);
            }
        } catch (e) {
            console.error('Error saving push token:', e);
        }
    };

    return {
        expoPushToken,
        notification
    };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            return;
        }

        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId || projectId === 'your-project-id') {
                console.log('Skipping push token fetch: No valid EAS project ID configured.');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (e) {
            console.log('Failed to fetch push token (expected in Expo Go without EAS):', e);
        }
    } else {
        // console.log('Must use physical device for Push Notifications');
    }

    return token;
}
