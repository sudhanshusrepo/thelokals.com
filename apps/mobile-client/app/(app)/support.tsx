import { SafeAreaView, Linking, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SupportScreen() {
    const router = useRouter();

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@thelokals.com');
    };

    const handleCallSupport = () => {
        Linking.openURL('tel:+1234567890');
    };

    const handleFaq = () => {
        Linking.openURL('https://thelokals.com/faq');
    };

    const supportOptions = [
        {
            icon: 'envelope',
            title: 'Email Support',
            subtitle: 'Get help via email',
            action: handleEmailSupport,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            icon: 'phone',
            title: 'Call Us',
            subtitle: 'Speak to an agent',
            action: handleCallSupport,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
        },
        {
            icon: 'question-circle',
            title: 'FAQs',
            subtitle: 'Common questions',
            action: handleFaq,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
            <ScrollView className="flex-1">
                <View className="p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <Text className="text-3xl font-bold text-slate-900 dark:text-white">Help & Support</Text>
                    <Text className="text-slate-500 dark:text-slate-400 mt-1">
                        We're here to help you with anything you need.
                    </Text>
                </View>

                <View className="p-4 gap-4">
                    {supportOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={option.action}
                            className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-row items-center"
                            activeOpacity={0.7}
                        >
                            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${option.bgColor} dark:bg-opacity-10`}>
                                <FontAwesome name={option.icon as any} size={20} className={option.color.replace('text-', 'color-')} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-slate-900 dark:text-white">{option.title}</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">{option.subtitle}</Text>
                            </View>
                            <FontAwesome name="chevron-right" size={14} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-8 px-6">
                    <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Legal</Text>
                    <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <TouchableOpacity
                            className="p-4 flex-row justify-between items-center border-b border-slate-100 dark:border-slate-700"
                            onPress={() => router.push('/(app)/terms')}
                        >
                            <Text className="text-slate-700 dark:text-slate-200 font-medium">Terms & Conditions</Text>
                            <FontAwesome name="external-link" size={12} color="#94a3b8" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="p-4 flex-row justify-between items-center"
                            onPress={() => router.push('/(app)/privacy')}
                        >
                            <Text className="text-slate-700 dark:text-slate-200 font-medium">Privacy Policy</Text>
                            <FontAwesome name="external-link" size={12} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="items-center mt-12 mb-8">
                    <Text className="text-slate-400 text-xs">Version 1.0.0</Text>
                    <Text className="text-slate-300 text-[10px] mt-1">© 2025 lokals</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
