import { SafeAreaView, TouchableOpacity, Image, ScrollView, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const handleBecomeProvider = () => {
    router.push('/(app)/provider-registration');
  };

  const menuItems = [
    { icon: 'user-circle', label: 'Edit Profile', action: () => { } },
    { icon: 'bell', label: 'Notifications', action: () => { } },
    { icon: 'credit-card', label: 'Payment Methods', action: () => { } },
    { icon: 'map-marker', label: 'Saved Addresses', action: () => { } },
    { icon: 'question-circle', label: 'Help & Support', action: () => router.push('/(app)/support') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView>
        {/* Header Section */}
        <View className="bg-white dark:bg-slate-800 pb-8 pt-4 px-6 rounded-b-3xl shadow-sm border-b border-slate-100 dark:border-slate-700">
          <View className="items-center">
            <View className="w-24 h-24 bg-teal-100 dark:bg-teal-900 rounded-full items-center justify-center mb-4 border-4 border-white dark:border-slate-700 shadow-lg">
              <FontAwesome name="user" size={40} color="#0d9488" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">John Doe</Text>
            <Text className="text-slate-500 dark:text-slate-400">john.doe@example.com</Text>
            <View className="flex-row mt-4 gap-2">
              <View className="bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full border border-teal-100 dark:border-teal-800">
                <Text className="text-teal-700 dark:text-teal-300 text-xs font-bold">Member</Text>
              </View>
              <View className="bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800">
                <Text className="text-purple-700 dark:text-purple-300 text-xs font-bold">Gurgaon</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Provider CTA */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={handleBecomeProvider}
            className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-teal-600 dark:to-teal-800 p-4 rounded-2xl shadow-lg flex-row items-center justify-between"
            style={{ backgroundColor: '#0f172a' }} // Fallback for gradient
          >
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Become a Provider</Text>
              <Text className="text-slate-300 text-sm mt-1">Earn money by offering your services</Text>
            </View>
            <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <FontAwesome name="briefcase" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View className="px-4 mt-6 mb-8 gap-3">
          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2 px-2">Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.action}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-8 h-8 bg-slate-50 dark:bg-slate-700 rounded-full items-center justify-center">
                  <FontAwesome name={item.icon as any} size={16} color="#64748b" />
                </View>
                <Text className="text-slate-700 dark:text-slate-200 font-medium text-base">{item.label}</Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color="#cbd5e1" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl flex-row items-center justify-between mt-4 border border-red-100 dark:border-red-900/30"
          >
            <View className="flex-row items-center gap-4">
              <View className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center">
                <FontAwesome name="sign-out" size={16} color="#ef4444" />
              </View>
              <Text className="text-red-600 dark:text-red-400 font-medium text-base">Log Out</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center mt-4"
            onPress={() => alert("Delete account functionality")}
          >
            <Text className="text-slate-400 text-xs">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
