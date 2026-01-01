import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PROVIDER_V2_TOKENS } from '@lokals/design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ProviderStatusBadge } from '../components/ProviderStatusBadge';

// Define navigation prop for Profile screen
type ProfileNavProp = StackNavigationProp<RootStackParamList>;

export const ProfileV2Screen = () => {
    const navigation = useNavigation<ProfileNavProp>();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>SV</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editBadge}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Text style={{ fontSize: 12 }}>✏️</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.name}>Sudhanshu Verma</Text>
                        <Text style={styles.phone}>+91 98765 43210</Text>
                        <View style={styles.badges}>
                            <ProviderStatusBadge status="approved" />
                            <View style={styles.digilockerBadge}>
                                <Text style={styles.digilockerText}>DigiLocker Verified ✅</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Edit Profile Button (Main CTA) */}
                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Manage Business</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Main', { screen: 'Availability' })}>
                        <Text style={styles.menuIcon}>🛠️</Text>
                        <Text style={styles.menuText}>Services & Availability</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BankDetails')}>
                        <Text style={styles.menuIcon}>🏦</Text>
                        <Text style={styles.menuText}>Bank & UPI Details</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>📄</Text>
                        <Text style={styles.menuText}>Documents</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>❓</Text>
                        <Text style={styles.menuText}>Help Center</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Version 2.1.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    scrollContent: {
        padding: PROVIDER_V2_TOKENS.spacing.lg,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: PROVIDER_V2_TOKENS.colors.gradientStart,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFF',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
        marginBottom: 4,
    },
    phone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    badges: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    digilockerBadge: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    digilockerText: {
        fontSize: 12,
        color: '#065F46',
        fontWeight: '600',
    },
    editProfileButton: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 24,
    },
    editProfileText: {
        color: '#333',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    menuItem: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        ...PROVIDER_V2_TOKENS.shadows.card,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuText: {
        fontSize: 16,
        color: PROVIDER_V2_TOKENS.colors.textPrimary,
        flex: 1,
    },
    arrow: {
        fontSize: 20,
        color: '#94A3B8',
    },
    logoutButton: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 16,
        marginTop: 8,
    },
    logoutText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 16,
    },
    version: {
        textAlign: 'center',
        marginTop: 24,
        color: '#94A3B8',
        fontSize: 12,
    },
});
