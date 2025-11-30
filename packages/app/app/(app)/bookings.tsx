import { StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

const mockBookings = [
  {
    id: '1',
    service: 'Plumbing Repair',
    status: 'Pending',
    date: 'Today, 2:00 PM',
    provider: 'Searching...',
    price: 'Est. $50-$80',
  },
  {
    id: '2',
    service: 'House Cleaning',
    status: 'Completed',
    date: 'Nov 28, 10:00 AM',
    provider: 'Sarah Jenkins',
    price: '$120',
  },
];

export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>
      <FlatList
        data={mockBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.serviceName}>{item.service}</Text>
              <View style={[styles.statusBadge, item.status === 'Pending' ? styles.statusPending : styles.statusCompleted]}>
                <Text style={[styles.statusText, item.status === 'Pending' ? styles.textPending : styles.textCompleted]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <FontAwesome name="calendar" size={14} color={Colors.slate[500]} />
                <Text style={styles.rowText}>{item.date}</Text>
              </View>
              <View style={styles.row}>
                <FontAwesome name="user" size={14} color={Colors.slate[500]} />
                <Text style={styles.rowText}>{item.provider}</Text>
              </View>
              <View style={styles.row}>
                <FontAwesome name="tag" size={14} color={Colors.slate[500]} />
                <Text style={styles.rowText}>{item.price}</Text>
              </View>
            </View>
          </View>
        )}
      />
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
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FFF7ED', // Orange-50
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4', // Green-50
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textPending: {
    color: '#C2410C', // Orange-700
  },
  textCompleted: {
    color: '#15803D', // Green-700
  },
  cardBody: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    color: Colors.slate[600],
    fontSize: 14,
  },
});
