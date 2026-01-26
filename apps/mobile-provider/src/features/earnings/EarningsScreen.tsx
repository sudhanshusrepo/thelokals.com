import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth, providerService } from '@thelocals/platform-core';
import { BarChart } from 'react-native-gifted-charts';
import { useFocusEffect } from '@react-navigation/native';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react-native';

export const EarningsScreen = () => {
    const { user } = useAuth();
    const [chartData, setChartData] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ total: 0, pending: 0 });

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [history, txs, stats] = await Promise.all([
                providerService.getEarningsHistory(user.id, 'week'),
                providerService.getTransactions(user.id),
                providerService.getDashboardStats(user.id)
            ]);

            // Format for Chart (Gifted Charts expects { value, label, frontColor? })
            const formattedChart = history.map(h => ({
                value: h.amount,
                label: h.date,
                frontColor: '#2563EB',
                gradientColor: '#60A5FA',
            }));

            setChartData(formattedChart);
            setTransactions(txs);
            setSummary({
                total: stats.monthlyEarnings,
                pending: 0 // Assume 0 for now or fetch specifics
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900">Earnings</Text>
                <TouchableOpacity className="p-2 bg-gray-50 rounded-full">
                    <Calendar size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Balance Card */}
                <View className="mx-5 mt-4 p-5 bg-blue-600 rounded-2xl shadow-lg">
                    <Text className="text-blue-100 font-medium mb-1">Total Earnings (Month)</Text>
                    <Text className="text-4xl font-bold text-white mb-4">${summary.total.toLocaleString()}</Text>

                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-blue-500/50 p-3 rounded-lg flex-row items-center gap-2">
                            <CreditCard size={16} color="white" />
                            <View>
                                <Text className="text-blue-100 text-xs">Pending</Text>
                                <Text className="text-white font-bold">${summary.pending}</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="flex-1 bg-white p-3 rounded-lg flex-row items-center justify-center gap-2">
                            <Text className="text-blue-600 font-bold">Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chart Section */}
                <View className="mt-8 px-5">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Weekly Overview</Text>
                    <View className="bg-white">
                        <BarChart
                            data={chartData}
                            barWidth={22}
                            noOfSections={4}
                            barBorderRadius={4}
                            frontColor="#2563EB"
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            isAnimated
                        />
                    </View>
                </View>

                {/* Recent Transactions */}
                <View className="mt-8 px-5 pb-10">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</Text>
                    {transactions.length === 0 ? (
                        <Text className="text-gray-400 text-center py-4">No transactions yet</Text>
                    ) : (
                        transactions.map(tx => (
                            <View key={tx.id} className="flex-row items-center justify-between py-4 border-b border-gray-100">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                                        <DollarSign size={20} color="#16A34A" />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-900">{tx.service_category}</Text>
                                        <Text className="text-gray-400 text-xs">{new Date(tx.created_at).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-green-600 text-base">+ ${tx.provider_earnings}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
