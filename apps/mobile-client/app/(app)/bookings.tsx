import { SafeAreaView, FlatList, TouchableOpacity, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const mockBookings = [
  {
    id: '1',
    service: 'Plumbing Repair',
    status: 'Pending',
    date: 'Today, 2:00 PM',
    provider: 'Searching...',
    price: 'Est. $50-$80',
    icon: 'wrench',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: '2',
    service: 'House Cleaning',
    status: 'Completed',
    date: 'Nov 28, 10:00 AM',
    provider: 'Sarah Jenkins',
    price: '$120',
    icon: 'home',
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    id: '3',
    service: 'Electrical Check',
    status: 'Cancelled',
    date: 'Nov 20, 4:00 PM',
    provider: 'Mike Ross',
    price: '$90',
    icon: 'bolt',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
];

export default function BookingsScreen() {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">My Bookings</Text>
        <Text className="text-slate-500 dark:text-slate-400 mt-1">Track your service requests</Text>
      </View>

      <FlatList
        data={mockBookings}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-4"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
            activeOpacity={0.7}
            onPress={() => router.push(`/(app)/booking/${item.id}` as any)}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-center gap-3">
                <View className={`w-12 h-12 rounded-full items-center justify-center ${item.bgColor}`}>
                  <FontAwesome name={item.icon as any} size={20} className={item.color.replace('text-', 'color-')} />
                </View>
                <View>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">{item.service}</Text>
                  <Text className="text-sm text-slate-500 dark:text-slate-400">{item.provider}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
                <Text className={`text-xs font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
              <View className="flex-row items-center gap-2">
                <FontAwesome name="calendar" size={14} color="#94a3b8" />
                <Text className="text-sm text-slate-600 dark:text-slate-300">{item.date}</Text>
              </View>
              <Text className="font-bold text-slate-900 dark:text-white">{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <FontAwesome name="calendar-o" size={48} color="#cbd5e1" />
            <Text className="text-lg font-semibold text-slate-400 mt-4">No bookings yet</Text>
            <TouchableOpacity
              className="mt-4 px-6 py-2 bg-teal-600 rounded-full"
              onPress={() => router.push('/(app)/home')}
            >
              <Text className="text-white font-bold">Book a Service</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
