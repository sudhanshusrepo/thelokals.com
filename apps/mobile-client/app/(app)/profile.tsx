import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { Card } from '@/components/shared';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const menuItems = [
    { icon: 'user-circle', label: 'Edit Profile', action: () => { } },
    { icon: 'bell', label: 'Notifications', action: () => { } },
    { icon: 'credit-card', label: 'Payment Methods', action: () => { } },
    { icon: 'map-marker', label: 'Saved Addresses', action: () => { } },
    { icon: 'question-circle', label: 'Help & Support', action: () => router.push('/(app)/support') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user" size={40} color={colors.primary} />
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, styles.tagTeal]}>
              <Text style={[styles.tagText, styles.tagTextTeal]}>Member</Text>
            </View>
            <View style={[styles.tag, styles.tagPurple]}>
              <Text style={[styles.tagText, styles.tagTextPurple]}>Gurgaon</Text>
            </View>
          </View>
        </View>

        {/* Provider CTA */}
        <TouchableOpacity style={styles.providerCard} onPress={() => router.push('/(app)/provider-registration')}>
          <View style={styles.providerInfo}>
            <Text style={styles.providerTitle}>Become a Provider</Text>
            <Text style={styles.providerSubtitle}>Earn money by offering your services</Text>
          </View>
          <View style={styles.providerIcon}>
            <FontAwesome name="briefcase" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuItem} onPress={item.action}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconBox}>
                  <FontAwesome name={item.icon as any} size={16} color={colors.textSecondary} />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={colors.borderMedium} />
            </Card>
          ))}

          <Card style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, styles.logoutIconBox]}>
                <FontAwesome name="sign-out" size={16} color={colors.accentRed} />
              </View>
              <Text style={[styles.menuItemLabel, styles.logoutText]}>Log Out</Text>
            </View>
          </Card>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={() => alert("Delete account functionality")}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.slate[50], // Slightly off-white background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 4,
    borderColor: colors.bgSurface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.slate[900],
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.slate[500],
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  tagTeal: {
    backgroundColor: Colors.teal[50],
    borderColor: Colors.teal[100],
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextTeal: {
    color: Colors.teal[700],
  },
  tagPurple: {
    backgroundColor: Colors.indigo[50] || '#eef2ff',
    borderColor: Colors.indigo[100] || '#e0e7ff',
  },
  tagTextPurple: {
    color: Colors.indigo[600] || '#4f46e5',
  },
  providerCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.slate[900], // Dark card
    shadowColor: Colors.slate[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  providerInfo: {
    flex: 1,
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  providerSubtitle: {
    fontSize: 14,
    color: Colors.slate[300],
  },
  providerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.slate[900],
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.slate[700],
  },
  logoutItem: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentRedLight + '20',
    borderColor: colors.accentRedLight,
  },
  logoutIconBox: {
    backgroundColor: colors.accentRedLight + '40',
  },
  logoutText: {
    color: colors.accentRed,
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  deleteText: {
    fontSize: 12,
    color: Colors.slate[400],
  },
});
