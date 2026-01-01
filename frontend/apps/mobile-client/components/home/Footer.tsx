import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { ExternalLink } from '@/components/ExternalLink';

const FooterSection = ({ title, links }: { title: string, links: { label: string, href?: string }[] }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {links.map((link, index) => (
            <TouchableOpacity key={index} style={styles.linkItem}>
                {/* Placeholder functionality - currently just generic touchables */}
                <Text style={styles.linkText}>{link.label}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

export const Footer = () => {
    return (
        <View style={styles.container}>

            {/* Container A: Popular + Company */}
            <View style={styles.rowContainer}>
                <FooterSection
                    title="Popular"
                    links={[
                        { label: 'AC Repair' },
                        { label: 'Cleaning' },
                        { label: 'Painting' },
                        { label: 'Pest Control' }
                    ]}
                />
                <FooterSection
                    title="Company"
                    links={[
                        { label: 'About Us' },
                        { label: 'Careers' },
                        { label: 'Blog' }
                    ]}
                />
            </View>

            <View style={styles.divider} />

            {/* Container B: Support + Legal */}
            <View style={styles.rowContainer}>
                <FooterSection
                    title="Support"
                    links={[
                        { label: 'Help Center' },
                        { label: 'Safety' },
                        { label: 'Contact Us' }
                    ]}
                />
                <FooterSection
                    title="Legal"
                    links={[
                        { label: 'Terms' },
                        { label: 'Privacy' },
                        { label: 'Cookies' }
                    ]}
                />
            </View>

            <View style={styles.divider} />

            {/* Social Links Row */}
            <View style={styles.socialRow}>
                <Text style={styles.connectText}>Connect with us</Text>
                <View style={styles.socialIcons}>
                    <ExternalLink href="https://twitter.com/thelokals" style={styles.socialIcon}>
                        <FontAwesome name="twitter" size={20} color={Colors.slate[500]} />
                    </ExternalLink>
                    <ExternalLink href="https://instagram.com/thelokals" style={styles.socialIcon}>
                        <FontAwesome name="instagram" size={20} color={Colors.slate[500]} />
                    </ExternalLink>
                    <ExternalLink href="https://facebook.com/thelokals" style={styles.socialIcon}>
                        <FontAwesome name="facebook" size={20} color={Colors.slate[500]} />
                    </ExternalLink>
                    <ExternalLink href="https://linkedin.com/company/thelokals" style={styles.socialIcon}>
                        <FontAwesome name="linkedin" size={20} color={Colors.slate[500]} />
                    </ExternalLink>
                </View>
            </View>

            <View style={styles.copyright}>
                <Text style={styles.copyrightText}>© 2025 The Lokals. All rights reserved.</Text>
            </View>

            {/* Bottom padding to extend past safe area/tabs */}
            <View style={{ height: 40 }} />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.slate[50], // Very light gray background
        paddingTop: 32,
        paddingHorizontal: 20,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.slate[200],
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    section: {
        flex: 1,
        paddingRight: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.slate[800],
        marginBottom: 16,
    },
    linkItem: {
        marginBottom: 10,
    },
    linkText: {
        fontSize: 14,
        color: Colors.slate[500],
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.slate[200],
        marginBottom: 24,
    },
    socialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    connectText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.slate[700],
    },
    socialIcons: {
        flexDirection: 'row',
    },
    socialIcon: {
        marginLeft: 20,
    },
    copyright: {
        alignItems: 'center',
        marginBottom: 20,
    },
    copyrightText: {
        fontSize: 12,
        color: Colors.slate[400],
    }
});
