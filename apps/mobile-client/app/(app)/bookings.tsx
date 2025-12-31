import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { CLIENT_V2_TOKENS, StatusCard, AnimatedCard } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useClientDesign } from '../../hooks/useClientDesign';

// Mock bookings data
const mockBookings = {
  upcoming: [
    {
      id: '1',
      service: 'Deep Cleaning',
      date: 'Today, 2:30 PM',
      status: 'confirmed' as const,
      price: 499,
      image: 'https://via.placeholder.com/80',
    },
    {
      id: '2',
      service: 'AC Repair',
      date: 'Tomorrow, 10:00 AM',
      status: 'assigned' as const,
      price: 799,
      image: 'https://via.placeholder.com/80',
    },
  ],
  completed: [
    {
      id: '3',
      service: 'Plumbing Repair',
      date: 'Dec 28, 3:00 PM',
      status: 'completed' as const,
      price: 299,
      rating: 5,
      image: 'https://via.placeholder.com/80',
    },
    {
      id: '4',
      service: 'Electrical Fix',
      date: 'Dec 25, 11:00 AM',
      status: 'completed' as const,
      price: 399,
      rating: 4,
      image: 'https://via.placeholder.com/80',
    },
  ],
  cancelled: [
    {
      id: '5',
      service: 'Salon at Home',
      date: 'Dec 20, 5:00 PM',
      status: 'cancelled' as const,
      price: 599,
      reason: 'Cancelled by user',
      image: 'https://via.placeholder.com/80',
    },
  ],
};

type TabId = 'upcoming' | 'completed' | 'cancelled';

const tabs: { id: TabId; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyBookingsScreen() {
  const router = useRouter();
  const { isV2Enabled } = useClientDesign();
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const currentBookings = mockBookings[activeTab];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#8AE98D';
      case 'assigned':
        return '#4A9EFF';
      case 'in_progress':
        return '#FFA500';
      case 'completed':
        return '#8AE98D';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#DDD';
    }
  };

  const renderBookingCard = useCallback(({ item }: any) => (
    <AnimatedCard
      style={styles.bookingCard}
      onPress={() => router.push({
        pathname: '/(app)/booking/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingImageContainer}>
          <Text style={styles.bookingImagePlaceholder}>📦</Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingService}>{item.service}</Text>
          <Text style={styles.bookingDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.bookingPrice}>₹{item.price}</Text>
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating}.0</Text>
          </View>
        )}
        {item.reason && (
          <Text style={styles.cancelReason}>{item.reason}</Text>
        )}
      </View>
    </AnimatedCard>
  ), [router]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>
        {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '✅' : '❌'}
      </Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'upcoming' ? 'No upcoming bookings' :
          activeTab === 'completed' ? 'No completed bookings' :
            'No cancelled bookings'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'upcoming' ? 'Book a service to get started!' :
          activeTab === 'completed' ? 'Your completed bookings will appear here' :
            'Your cancelled bookings will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(app)/services')}
        >
          <Text style={styles.emptyButtonText}>Browse Services</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!isV2Enabled) {
    // Redirect to legacy bookings screen
    router.replace('/(app)/bookings');
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            <Text style={styles.tabCount}>
              ({mockBookings[tab.id].length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={currentBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}

        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: CLIENT_V2_TOKENS.radius.button,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: CLIENT_V2_TOKENS.colors.textSecondary,
    marginRight: 4,
  },
  tabTextActive: {
    color: CLIENT_V2_TOKENS.colors.textPrimary,
  },
  tabCount: {
    fontSize: 12,
    color: CLIENT_V2_TOKENS.colors.textTertiary,
  },
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: CLIENT_V2_TOKENS.radius.card,
    padding: 16,
    marginBottom: 16,
    ...CLIENT_V2_TOKENS.shadows.card,
  },
  bookingHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bookingImageContainer: {
    width: 60,
    height: 60,
    borderRadius: CLIENT_V2_TOKENS.radius.sm,
    backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingImagePlaceholder: {
    fontSize: 32,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: '600',
    color: CLIENT_V2_TOKENS.colors.textPrimary,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: CLIENT_V2_TOKENS.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: CLIENT_V2_TOKENS.radius.pill,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: CLIENT_V2_TOKENS.colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: CLIENT_V2_TOKENS.colors.textPrimary,
  },
  cancelReason: {
    fontSize: 12,
    color: CLIENT_V2_TOKENS.colors.textTertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CLIENT_V2_TOKENS.colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: CLIENT_V2_TOKENS.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: CLIENT_V2_TOKENS.colors.accentDanger,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: CLIENT_V2_TOKENS.radius.button,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
