import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, SafeAreaView, ScrollView, TextInput, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { HowItWorks } from '@/components/HowItWorks';
import { StickyChatCta } from '@/components/StickyChatCta';
import { UnicornAnimatedView } from '@/components/UnicornAnimatedView';

const categories = [
  { name: 'Plumbers' },
  { name: 'Electricians' },
  { name: 'Gardeners' },
  { name: 'Carpenters' },
  { name: 'Painters' },
  { name: 'Cleaners' },
];

export default function HomeScreen() {
  const [isCtaVisible, setIsCtaVisible] = useState(false);
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    // Show when scrolling up and not at the very top
    if (currentScrollY < lastScrollY.current && currentScrollY > 50) {
      setIsCtaVisible(true);
    } else if (currentScrollY > lastScrollY.current || currentScrollY < 50) {
      setIsCtaVisible(false);
    }

    lastScrollY.current = currentScrollY;
  };

  const router = useRouter();

  const handleChatSend = (content: { type: 'text' | 'audio' | 'video', data: string }) => {

    router.push({
      pathname: '/(app)/ai-booking',
      params: { type: content.type, data: content.data }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>lokals</Text>
      </View>

      <UnicornAnimatedView style={styles.backgroundAnimation} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <FontAwesome name="search" size={20} color={Colors.slate[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a service"
            />
          </View>
        </View>

        <HowItWorks />

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

        {/* Spacer for bottom content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <StickyChatCta
        isVisible={isCtaVisible}
        onSend={handleChatSend}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 70, // Below header approx
    left: 0,
    right: 0,
    height: '60%',
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[200],
    backgroundColor: '#fff',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.9)', // slate[100] with opacity
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.slate[200],
    minWidth: 100,
  },
});
