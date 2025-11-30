import { StyleSheet, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

export default function SupportScreen() {
    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@thelokals.com');
    };

    const handleCallSupport = () => {
        Linking.openURL('tel:+1234567890');
    };

    const handleFaq = () => {
        Linking.openURL('https://thelokals.com/faq');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Support</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.description}>
                    Need help? Contact our support team or browse our FAQs.
                </Text>

                <TouchableOpacity style={styles.option} onPress={handleEmailSupport}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="envelope" size={24} color={Colors.teal} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Email Support</Text>
                        <Text style={styles.optionSubtitle}>Get help via email</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={16} color={Colors.slate[400]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleCallSupport}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="phone" size={24} color={Colors.teal} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Call Us</Text>
                        <Text style={styles.optionSubtitle}>Speak to an agent</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={16} color={Colors.slate[400]} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleFaq}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="question-circle" size={24} color={Colors.teal} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>FAQs</Text>
                        <Text style={styles.optionSubtitle}>Frequently Asked Questions</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={16} color={Colors.slate[400]} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.linkOption} onPress={() => Linking.openURL('https://thelokals.com/privacy')}>
                    <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkOption} onPress={() => Linking.openURL('https://thelokals.com/terms')}>
                    <Text style={styles.linkText}>Terms of Service</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.slate[200],
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    description: {
        fontSize: 16,
        color: Colors.slate[500],
        marginBottom: 24,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.slate[200],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.slate[100],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
        color: Colors.slate[500],
    },
    divider: {
        height: 1,
        backgroundColor: Colors.slate[200],
        marginVertical: 24,
    },
    linkOption: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    linkText: {
        color: Colors.teal,
        fontSize: 16,
        fontWeight: '500',
    },
});
