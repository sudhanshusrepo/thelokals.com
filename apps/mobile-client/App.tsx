import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProvider } from './src/providers/AppProvider';
import { NotificationProvider } from './src/providers/NotificationProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NotificationProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </NotificationProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
