import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';

export default function PrivacyScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <Text style={styles.lastUpdated}>Last Updated: November 30, 2025</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Introduction */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.paragraph}>
                        TheLokals.com collects and processes user data to connect busy families, students, bachelors, home chefs, and providers for services like maids, tiffins, repairs, and car maintenance.
                    </Text>
                    <View style={styles.highlightBox}>
                        <Text style={styles.highlightText}>
                            ✓ This policy complies with India's Digital Personal Data Protection Act 2023 (DPDP Act) and IT Rules 2011.
                        </Text>
                    </View>
                </View>

                {/* Information We Collect */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>

                    <Text style={styles.subTitle}>Personal Data</Text>
                    <Text style={styles.bulletPoint}>• Name - For account identification</Text>
                    <Text style={styles.bulletPoint}>• Phone Number - For communication</Text>
                    <Text style={styles.bulletPoint}>• Email Address - For notifications</Text>
                    <Text style={styles.bulletPoint}>• Location - For service matching</Text>
                    <Text style={styles.bulletPoint}>• Payment Details - Securely stored</Text>

                    <Text style={styles.subTitle}>Non-Personal Data</Text>
                    <Text style={styles.bulletPoint}>• Device type and OS</Text>
                    <Text style={styles.bulletPoint}>• IP address</Text>
                    <Text style={styles.bulletPoint}>• Usage patterns</Text>
                    <Text style={styles.bulletPoint}>• Cookies and analytics</Text>

                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            ⚠️ We do NOT collect biometric data or health records without explicit consent.
                        </Text>
                    </View>
                </View>

                {/* How We Use Your Data */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>

                    <View style={styles.useCase}>
                        <Text style={styles.useCaseTitle}>🔍 Service Delivery</Text>
                        <Text style={styles.bulletPoint}>• Facilitate bookings</Text>
                        <Text style={styles.bulletPoint}>• Match users with providers</Text>
                        <Text style={styles.bulletPoint}>• Process payments</Text>
                    </View>

                    <View style={styles.useCase}>
                        <Text style={styles.useCaseTitle}>📊 Improvements</Text>
                        <Text style={styles.bulletPoint}>• Personalized recommendations</Text>
                        <Text style={styles.bulletPoint}>• Analytics and insights</Text>
                        <Text style={styles.bulletPoint}>• Feature development</Text>
                    </View>

                    <View style={styles.useCase}>
                        <Text style={styles.useCaseTitle}>🛡️ Security</Text>
                        <Text style={styles.bulletPoint}>• Fraud prevention</Text>
                        <Text style={styles.bulletPoint}>• Dispute resolution</Text>
                        <Text style={styles.bulletPoint}>• Legal compliance</Text>
                    </View>
                </View>

                {/* Sharing and Disclosure */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Sharing and Disclosure</Text>

                    <Text style={styles.subTitle}>With Service Providers</Text>
                    <Text style={styles.paragraph}>
                        Your information is shared with matched providers solely for service delivery.
                    </Text>

                    <Text style={styles.subTitle}>With Third Parties</Text>
                    <Text style={styles.bulletPoint}>• Firebase/Supabase (hosting)</Text>
                    <Text style={styles.bulletPoint}>• Payment gateways</Text>
                    <Text style={styles.bulletPoint}>• Analytics tools (anonymized)</Text>

                    <View style={styles.commitmentBox}>
                        <Text style={styles.commitmentText}>
                            ✓ We do NOT sell your data to advertisers
                        </Text>
                    </View>

                    <Text style={styles.subTitle}>Legal Disclosures</Text>
                    <Text style={styles.paragraph}>
                        We may disclose information when required by law, court orders, or to prevent fraud.
                    </Text>
                </View>

                {/* Data Security */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Data Security</Text>

                    <Text style={styles.subTitle}>Security Measures</Text>
                    <Text style={styles.bulletPoint}>• AES-256 encryption</Text>
                    <Text style={styles.bulletPoint}>• Access controls with MFA</Text>
                    <Text style={styles.bulletPoint}>• Regular security audits</Text>
                    <Text style={styles.bulletPoint}>• Secure cloud infrastructure</Text>

                    <View style={styles.breachBox}>
                        <Text style={styles.breachTitle}>🚨 Data Breach Protocol</Text>
                        <Text style={styles.paragraph}>
                            We will notify affected users within 72 hours as required by DPDP Act.
                        </Text>
                    </View>

                    <Text style={styles.subTitle}>Data Retention</Text>
                    <Text style={styles.bulletPoint}>• Active accounts: Indefinite</Text>
                    <Text style={styles.bulletPoint}>• Transaction records: 7 years</Text>
                    <Text style={styles.bulletPoint}>• Inactive accounts: 6 months</Text>
                </View>

                {/* Your Rights */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Your Rights</Text>
                    <Text style={styles.paragraph}>
                        Under DPDP Act 2023, you have the right to:
                    </Text>

                    <View style={styles.rightBox}>
                        <Text style={styles.rightTitle}>📋 Access</Text>
                        <Text style={styles.rightDesc}>Request a copy of your data</Text>
                    </View>

                    <View style={styles.rightBox}>
                        <Text style={styles.rightTitle}>✏️ Correction</Text>
                        <Text style={styles.rightDesc}>Update inaccurate information</Text>
                    </View>

                    <View style={styles.rightBox}>
                        <Text style={styles.rightTitle}>🗑️ Deletion</Text>
                        <Text style={styles.rightDesc}>Request account deletion</Text>
                    </View>

                    <View style={styles.rightBox}>
                        <Text style={styles.rightTitle}>📤 Portability</Text>
                        <Text style={styles.rightDesc}>Export your data</Text>
                    </View>

                    <View style={styles.rightBox}>
                        <Text style={styles.rightTitle}>🚫 Opt-Out</Text>
                        <Text style={styles.rightDesc}>Unsubscribe from marketing</Text>
                    </View>
                </View>

                {/* Cookies */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
                    <Text style={styles.paragraph}>
                        We use cookies for platform functionality, analytics, and preferences. You can manage cookies through browser settings.
                    </Text>
                </View>

                {/* Children's Privacy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
                    <Text style={styles.paragraph}>
                        TheLokals.com is not intended for children under 18. We do not knowingly collect data from minors without parental consent.
                    </Text>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Contact Information</Text>
                    <View style={styles.contactBox}>
                        <Text style={styles.paragraph}>
                            For questions or to exercise your rights:
                        </Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@thelokals.com')}>
                            <Text style={styles.link}>Email: support@thelokals.com</Text>
                        </TouchableOpacity>
                        <Text style={styles.smallText}>Grievance Officer (DPDP Act 2023)</Text>
                        <Text style={styles.smallText}>Response time: Within 48 hours</Text>
                    </View>
                </View>

                {/* Acceptance */}
                <View style={styles.acceptanceBox}>
                    <Text style={styles.acceptanceText}>
                        By using TheLokals.com, you acknowledge that you have read, understood, and agree to this Privacy Policy.
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
        backgroundColor: Colors.teal[50],
        borderLeftWidth: 4,
        borderLeftColor: Colors.teal[500],
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    highlightText: {
        fontSize: 14,
        color: Colors.slate[900],
        fontWeight: '600',
    },
    warningBox: {
        backgroundColor: Colors.amber[50],
        borderLeftWidth: 4,
        borderLeftColor: Colors.amber[500],
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    warningText: {
        fontSize: 14,
        color: Colors.slate[900],
        fontWeight: '600',
    },
    useCase: {
        backgroundColor: Colors.slate[50],
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    useCaseTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.slate[900],
        marginBottom: 6,
    },
    commitmentBox: {
        backgroundColor: Colors.green[50],
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    commitmentText: {
        fontSize: 14,
        color: Colors.green[900],
        fontWeight: '600',
    },
    breachBox: {
        backgroundColor: Colors.red[50],
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 12,
    },
    breachTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.red[900],
        marginBottom: 6,
    },
    rightBox: {
        backgroundColor: Colors.slate[50],
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    rightTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.slate[900],
        marginBottom: 4,
    },
    rightDesc: {
        fontSize: 13,
        color: Colors.slate[600],
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
        marginBottom: 8,
    },
    smallText: {
        fontSize: 12,
        color: Colors.slate[600],
        marginTop: 4,
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
