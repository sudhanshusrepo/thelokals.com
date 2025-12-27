import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, SafeAreaView, ScrollView, NativeSyntheticEvent, NativeScrollEvent, View as RNView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Card } from '@/components/shared';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { HowItWorks } from '@/components/HowItWorks';
import { StickyChatCta } from '@/components/StickyChatCta';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeSearch } from '@/components/home/HomeSearch';
import { WhyLokals } from '@/components/home/WhyLokals';
import { Footer } from '@/components/home/Footer';
import { useLocation } from '@/contexts/LocationContext';

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
  const router = useRouter();


  const { requestLocation } = useLocation();

  useEffect(() => {
    requestLocation();
  }, []);

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

  const handleChatSend = (content: { type: 'text' | 'audio' | 'video', data: string }) => {
    router.push({
      pathname: '/(app)/ai-booking',
      params: { type: content.type, data: content.data }
    });
  };

  const handleSearch = (text: string) => {
    handleChatSend({ type: 'text', data: text });
  };

  const handleMicPress = () => {
    // Stub for now - open AI booking with audio intent
    // ideally trigger recording UI
    handleChatSend({ type: 'audio', data: 'recording_placeholder' });
  };

  const handleCameraPress = () => {
    // Stub for now
    handleChatSend({ type: 'video', data: 'image_placeholder' });
  };

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <RNView style={styles.heroWrapper}>
          <HomeHero />
          <HomeSearch
            onSearch={handleSearch}
            onMicPress={handleMicPress}
            onCameraPress={handleCameraPress}
          />
        </RNView>

        <View style={styles.mainContent}>
          <HowItWorks />

          <View style={styles.categoriesContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={styles.categoriesTitle}>Categories</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/browse')}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category, index) => (
                <Card
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => router.push({
                    pathname: '/(app)/browse',
                    params: { category: category.name }
                  })}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                </Card>
              ))}
            </ScrollView>
          </View>

          <WhyLokals />

          <Footer />
        </View>
      </ScrollView>

      <StickyChatCta
        isVisible={isCtaVisible}
        onSend={handleChatSend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroWrapper: {
    position: 'relative',
    marginBottom: 40, // Space for the overlapping search bar
  },
  mainContent: {
    paddingTop: 10,
  },
  categoriesContainer: {
    padding: spacing.lg,
  },
  categoriesTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  categoryCard: {
    marginRight: spacing.md,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
