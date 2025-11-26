import { StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const categories = [
  { name: 'Plumbers' },
  { name: 'Electricians' },
  { name: 'Gardeners' },
  { name: 'Carpenters' },
  { name: 'Painters' },
  { name: 'Cleaners' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Lokals</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <FontAwesome name="search" size={20} color={Colors.slate[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a service"
            />
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category, index) => (
              <View key={index} style={styles.categoryCard}>
                <Text>{category.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  searchContainer: {
    padding: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
