import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@thelocals/core';

// Types
interface Booking {
  id: string;
  status: string;
  user: { name: string } | null;
  notes: string;
  created_at: string;
  worker_id: string;
}

// Mock Auth Context (Simplified for Porting)
const useAuth = () => {
  // In real implementation, this would use AsyncStorage and Supabase Auth
  // For now, we simulate a "signed in" state if we had a way to sign in, 
  // or just return null to show "Sign In Required". 
  // To verify the UI, let's assume we have a user if we successfully fetch.
  return {
    user: { id: 'test-worker-id' }, // Mock user for UI dev
    loading: false
  };
};

// Components
const ProviderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Requests');

  useEffect(() => {
    // In real app, fetch from Supabase
    // const fetchBookings = async () => { ... }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Dashboard</Text>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>₹0.00</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Requests', 'Bookings', 'Profile'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'Requests' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>⚡️</Text>
            <Text style={styles.emptyStateTitle}>No new live requests</Text>
            <Text style={styles.emptyStateText}>You will be notified when a new request comes in.</Text>
          </View>
        )}

        {activeTab === 'Bookings' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🗓️</Text>
            <Text style={styles.emptyStateTitle}>No jobs found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

import { HomeV2Screen } from './src/screens/HomeV2';
import { useFeatureFlag, PROVIDER_DESIGN_V2 } from './src/lib/featureFlags';

export default function App() {
  const [ready, setReady] = useState(false);
  const showV2 = useFeatureFlag(PROVIDER_DESIGN_V2);

  useEffect(() => {
    // Simulate app loading
    setTimeout(() => setReady(true), 1000);
  }, []);

  if (!ready) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      {showV2 ? <HomeV2Screen /> : <ProviderDashboard />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  earningsCard: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
  },
  earningsLabel: {
    color: '#d1fae5',
    fontSize: 14,
    marginBottom: 4,
  },
  earningsValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    paddingVertical: 16,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0D9488',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0D9488',
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
