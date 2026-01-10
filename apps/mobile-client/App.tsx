import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProvider } from './src/providers/AppProvider';
import { NotificationProvider } from './src/providers/NotificationProvider';
import { LocationProvider } from './src/contexts/LocationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <LocationProvider>
          <NotificationProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </NotificationProvider>
        </LocationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
