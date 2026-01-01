import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { CLIENT_V2_TOKENS, ServiceCard, SkeletonServiceCard, AnimatedCard } from '@lokals/design-system';
import { useRouter } from 'expo-router';
import { useClientDesign } from '../../../hooks/useClientDesign';

// Mock data - replace with API call
const mockServices = [
    { id: '1', serviceImage: 'https://via.placeholder.com/160x120', title: 'Deep Cleaning', price: '₹499', rating: 4.9, category: 'cleaning', isBestMatch: true },
    { id: '2', serviceImage: 'https://via.placeholder.com/160x120', title: 'Plumbing Repair', price: '₹299', rating: 4.8, category: 'repair' },
    { id: '3', serviceImage: 'https://via.placeholder.com/160x120', title: 'Electrical Fix', price: '₹399', rating: 4.7, category: 'repair' },
    { id: '4', serviceImage: 'https://via.placeholder.com/160x120', title: 'Salon at Home', price: '₹599', rating: 4.9, category: 'beauty' },
    { id: '5', serviceImage: 'https://via.placeholder.com/160x120', title: 'AC Repair', price: '₹799', rating: 4.8, category: 'appliances', isBestMatch: true },
    { id: '6', serviceImage: 'https://via.placeholder.com/160x120', title: 'Painting', price: '₹1299', rating: 4.7, category: 'repair' },
];

const categories = [
    { id: 'all', name: 'All' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'repair', name: 'Repair' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'appliances', name: 'Appliances' },
];

export default function ServicesListScreen() {
    const router = useRouter();
    const { isV2Enabled } = useClientDesign();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filter services
    const filteredServices = useMemo(() =>
        mockServices.filter(service => {
            const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        }),
        [searchQuery, selectedCategory]
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const renderServiceCard = useCallback(({ item }: any) => (
        <AnimatedCard
            style={styles.serviceCardWrapper}
            onPress={() => router.push({
                pathname: '/(app)/service/[id]',
                params: { id: item.id }
            })}
        >
            <ServiceCard
                serviceImage={item.serviceImage}
                title={item.title}
                price={item.price}
                rating={item.rating}
                isBestMatch={item.isBestMatch}
            />
        </AnimatedCard>
    ), [router]);

    const renderSkeletonLoader = () => (
        <View style={styles.gridContent}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <View key={i} style={styles.serviceCardWrapper}>
                    <SkeletonServiceCard />
                </View>
            ))}
        </View>
    );

    if (!isV2Enabled) {
        // Redirect to legacy browse screen
        router.replace('/(app)/browse');
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search services..."
                        placeholderTextColor={CLIENT_V2_TOKENS.colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Category Chips */}
            <View style={styles.categoriesSection}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item.id && styles.categoryChipActive,
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                        >
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    selectedCategory === item.id && styles.categoryChipTextActive,
                                ]}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Services Grid */}
            {loading ? renderSkeletonLoader() : (
                <FlatList
                    data={filteredServices}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.gridContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={renderServiceCard}

                    // Performance optimizations
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={10}
                    removeClippedSubviews={true}
                    getItemLayout={(data, index) => ({
                        length: 240,
                        offset: 240 * Math.floor(index / 2),
                        index,
                    })}

                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyTitle}>No services found</Text>
                            <Text style={styles.emptyDescription}>
                                Try adjusting your search or filters
                            </Text>
                        </View>
                    }
                />
            )}      </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
    },
    searchSection: {
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        borderRadius: CLIENT_V2_TOKENS.radius.button,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    categoriesSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: CLIENT_V2_TOKENS.radius.pill,
        backgroundColor: CLIENT_V2_TOKENS.colors.bgPrimary,
        marginRight: 12,
    },
    categoryChipActive: {
        backgroundColor: CLIENT_V2_TOKENS.colors.gradientStart,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textSecondary,
    },
    categoryChipTextActive: {
        color: CLIENT_V2_TOKENS.colors.textPrimary,
    },
    gridContent: {
        padding: 8,
    },
    serviceCardWrapper: {
        flex: 1,
        maxWidth: '50%',
        padding: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: CLIENT_V2_TOKENS.colors.textPrimary,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: CLIENT_V2_TOKENS.colors.textSecondary,
        textAlign: 'center',
    },
});
