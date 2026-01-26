import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsListScreen } from '../features/jobs/JobsListScreen';
import { JobDetailsScreen } from '../features/jobs/JobDetailsScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { ScheduleScreen } from '../features/profile/screens/ScheduleScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';

export type JobsStackParamList = {
    JobsList: undefined;
    JobDetails: { bookingId: string };
    EditProfile: undefined;
    Schedule: undefined;
    Notifications: undefined;
};

const Stack = createNativeStackNavigator<JobsStackParamList>();

export const JobsNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="JobsList" component={JobsListScreen} />
            <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
                options={{ headerShown: true, title: 'Job Details', headerBackTitle: 'Jobs' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};
