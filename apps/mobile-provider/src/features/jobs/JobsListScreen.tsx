import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, providerService, Booking } from '@thelocals/platform-core';
import { JobCard } from './components/JobCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, Briefcase } from 'lucide-react-native';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobsStackParamList } from '../../navigation/JobsNavigator';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = 'active' | 'requests' | 'history';

type JobsScreenNavigationProp = NativeStackNavigationProp<JobsStackParamList, 'JobsList'>;

export const JobsListScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<JobsScreenNavigationProp>();
    const [activeTab, setActiveTab] = useState<Tab>('active');
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [jobs, setJobs] = useState<Booking[]>([]);
    const [requests, setRequests] = useState<Booking[]>([]);
    const [history, setHistory] = useState<Booking[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const [activeData, historyData] = await Promise.all([
                providerService.getJobs(user.id, ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS']),
                providerService.getJobs(user.id, ['COMPLETED', 'CANCELLED', 'EXPIRED']),
            ]);

            const requestDataRaw = await providerService.getRequests(user.id);
            const requestData = requestDataRaw.map(r => r.bookings as unknown as Booking).filter(Boolean);

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setJobs(activeData);
            setHistory(historyData);
            setRequests(requestData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleTabChange = (tab: Tab) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTab(tab);
    };

    const filteredData = useMemo(() => {
        let dataset: Booking[] = [];
        switch (activeTab) {
            case 'requests': dataset = requests; break;
            case 'active': dataset = jobs; break;
            case 'history': dataset = history; break;
        }

        if (!searchQuery.trim()) return dataset;

        const lowerQuery = searchQuery.toLowerCase();
        return dataset.filter(item =>
            item.service_category?.toLowerCase().includes(lowerQuery) ||
            item.user?.name?.toLowerCase().includes(lowerQuery) ||
            item.address?.formatted?.toLowerCase().includes(lowerQuery)
        );
    }, [activeTab, requests, jobs, history, searchQuery]);

    const handleJobPress = (booking: Booking) => {
        navigation.navigate('JobDetails', { bookingId: booking.id });
    };

    const renderTab = (tab: Tab, label: string, count?: number) => (
        <TouchableOpacity
            onPress={() => handleTabChange(tab)}
            className={`flex-1 items-center py-3 border-b-2 ${activeTab === tab ? 'border-blue-600' : 'border-transparent'}`}
        >
            <Text className={`font-semibold ${activeTab === tab ? 'text-blue-600' : 'text-gray-500'}`}>
                {label} {count !== undefined && count > 0 && `(${count})`}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <ScreenHeader
                title="My Jobs"
                showBack={false}
                className="pb-0 border-b-0"
            />

            {/* Search Bar - Integrated under header */}
            <View className="bg-white px-4 pb-3">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5">
                    <Search size={18} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-900 text-base"
                        placeholder="Search jobs, customers..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-200">
                {renderTab('requests', 'Requests', requests.length)}
                {renderTab('active', 'Active', jobs.length)}
                {renderTab('history', 'History')}
            </View>

            {/* Content */}
            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={item => item?.id || Math.random().toString()}
                    renderItem={({ item }) => (
                        item ? <JobCard
                            booking={item}
                            onPress={() => handleJobPress(item)}
                            isRequest={activeTab === 'requests'}
                        /> : null
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon={Briefcase}
                            title="No jobs found"
                            description={
                                activeTab === 'requests' ? "You don't have any new requests at the moment." :
                                    activeTab === 'active' ? "You don't have any active jobs." :
                                        "You haven't completed any jobs yet."
                            }
                        />
                    }
                />
            )}
        </View>
    );
};
