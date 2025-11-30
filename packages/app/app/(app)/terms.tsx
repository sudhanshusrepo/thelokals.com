import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

export default function TermsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <Text style={styles.lastUpdated}>Last Updated: November 30, 2025</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Introduction */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        These Terms and Conditions outline the rules for using TheLokals.com, a platform connecting users with local home services like maids, tiffins, repairs, and car services in India.
                    </Text>
                    <Text style={styles.paragraph}>
                        By accessing or using the site, users agree to these terms, which prioritize safe transactions for busy families, students, working professionals, and neighborhood providers.
                    </Text>
                    <View style={styles.highlightBox}>
                        <Text style={styles.highlightText}>
                            ⚠️ The platform operates as a marketplace, not a direct service provider.
                        </Text>
                    </View>
                </View>

                {/* User Eligibility */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. User Eligibility</Text>
                    <Text style={styles.subTitle}>Age Requirements</Text>
                    <Text style={styles.paragraph}>
                        Users must be at least 18 years old. Minors may use the platform only with parental consent.
                    </Text>

                    <Text style={styles.subTitle}>Account Registration</Text>
                    <Text style={styles.bulletPoint}>• Registration requires accurate phone and email</Text>
                    <Text style={styles.bulletPoint}>• False information leads to account suspension</Text>
                    <Text style={styles.bulletPoint}>• Users are responsible for account security</Text>

                    <Text style={styles.subTitle}>Provider Verification</Text>
                    <Text style={styles.paragraph}>
                        Service providers must verify identity and credentials before listing services.
                    </Text>
                </View>

                {/* Services and Bookings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Services and Bookings</Text>
                    <Text style={styles.paragraph}>
                        Bookings can be made via app or web. The platform facilitates matches but does not handle payments directly—use secure UPI or cards.
                    </Text>

                    <Text style={styles.subTitle}>Cancellation Policy</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>User Cancellations:</Text>
                        <Text style={styles.bulletPoint}>• Free within 2 hours of booking</Text>
                        <Text style={styles.bulletPoint}>• Fees apply after 2 hours</Text>
                        <Text style={styles.bulletPoint}>• No-show fees if provider arrives</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Provider Cancellations:</Text>
                        <Text style={styles.bulletPoint}>• 24 hours notice required</Text>
                        <Text style={styles.bulletPoint}>• Penalties for late cancellations</Text>
                    </View>
                </View>

                {/* Prohibited Conduct */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Prohibited Conduct</Text>
                    <Text style={styles.paragraph}>
                        The following activities result in immediate account suspension or permanent ban:
                    </Text>
                    <Text style={styles.bulletPoint}>• Spam, fake bookings, or fraud</Text>
                    <Text style={styles.bulletPoint}>• Harassment or threatening behavior</Text>
                    <Text style={styles.bulletPoint}>• Illegal activities</Text>
                    <Text style={styles.bulletPoint}>• Misuse of personal data</Text>
                    <Text style={styles.bulletPoint}>• Reverse-engineering the platform</Text>
                </View>

                {/* Legal Compliance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Legal Compliance</Text>
                    <Text style={styles.paragraph}>
                        All users must comply with Indian laws including:
                    </Text>
                    <Text style={styles.bulletPoint}>• Information Technology Act, 2000</Text>
                    <Text style={styles.bulletPoint}>• Digital Personal Data Protection Act, 2023</Text>
                    <Text style={styles.bulletPoint}>• Consumer Protection Act, 2019</Text>
                </View>

                {/* Limitation of Liability */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
                    <Text style={styles.paragraph}>
                        TheLokals.com acts solely as a marketplace. We are not responsible for:
                    </Text>
                    <Text style={styles.bulletPoint}>• Quality or safety of services provided</Text>
                    <Text style={styles.bulletPoint}>• Actions of service providers</Text>
                    <Text style={styles.bulletPoint}>• Disputes between users and providers</Text>
                    <Text style={styles.bulletPoint}>• Service interruptions or technical issues</Text>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Contact Information</Text>
                    <View style={styles.contactBox}>
                        <Text style={styles.paragraph}>
                            For questions regarding these Terms and Conditions:
                        </Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@thelokals.com')}>
                            <Text style={styles.link}>Email: support@thelokals.com</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Acceptance */}
                <View style={styles.acceptanceBox}>
                    <Text style={styles.acceptanceText}>
                        By using TheLokals.com, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.slate[900],
    },
    lastUpdated: {
        fontSize: 12,
        color: Colors.slate[500],
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.slate[900],
        marginBottom: 12,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.slate[800],
        marginTop: 12,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        color: Colors.slate[700],
        lineHeight: 22,
        marginBottom: 12,
    },
    bulletPoint: {
        fontSize: 14,
        color: Colors.slate[700],
        lineHeight: 22,
        marginLeft: 8,
        marginBottom: 6,
    },
    highlightBox: {
        backgroundColor: Colors.amber[50],
        borderLeftWidth: 4,
        borderLeftColor: Colors.amber[500],
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    highlightText: {
        fontSize: 14,
        color: Colors.slate[900],
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: Colors.slate[50],
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.slate[900],
        marginBottom: 6,
    },
    contactBox: {
        backgroundColor: Colors.teal[50],
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    link: {
        fontSize: 14,
        color: Colors.teal[600],
        fontWeight: '600',
        marginTop: 8,
    },
    acceptanceBox: {
        backgroundColor: Colors.slate[100],
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    acceptanceText: {
        fontSize: 12,
        color: Colors.slate[600],
        fontStyle: 'italic',
        lineHeight: 18,
    },
});
