import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PROVIDER_V2_TOKENS } from '@lokals/design-system';

export const EarningsV2Screen = () => {
    const payouts = [
        { id: 'pending', status: 'Pending', amount: 1250, date: 'This week' },
        { id: 'completed', status: 'Completed', amount: 12300, date: 'Dec 15-21' },
        { id: 'next', status: 'Next payout', amount: '₹12,500+', date: 'Every Friday' }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={{ paddingTop: 20, padding: 20 }}>
                    <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#0E121A' }}>Earnings Board</Text>

                    {/* Monthly Hero Chart */}
                    <LinearGradient
                        colors={['#F7C846', '#8AE98D']}
                        style={{
                            height: 240,
                            borderRadius: 24,
                            padding: 24,
                            marginBottom: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: 0.15,
                            shadowRadius: 24,
                            elevation: 16
                        }}
                    >
                        <Text style={{ fontSize: 14, color: 'rgba(14,18,26,0.8)', marginBottom: 8 }}>
                            December earnings
                        </Text>
                        <Text style={{ fontSize: 36, fontWeight: '800', color: '#0E121A', marginBottom: 12 }}>
                            ₹24,500
                        </Text>
                        <Text style={{ fontSize: 16, color: '#0E121A', fontWeight: '700', marginBottom: 20 }}>
                            +18% from last month
                        </Text>
                        {/* Chart Placeholder */}
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 16,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: 'rgba(14,18,26,0.6)', fontSize: 14 }}>📈 Earnings chart</Text>
                        </View>
                    </LinearGradient>

                    {/* Payout Cards */}
                    <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#0E121A' }}>
                        Payout status
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginHorizontal: -20, paddingHorizontal: 20 }}>
                        {payouts.map((payout, index) => (
                            <View key={payout.id} style={{
                                width: 280,
                                backgroundColor: 'white',
                                marginRight: 16,
                                padding: 24,
                                borderRadius: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 16,
                                elevation: 8,
                                marginBottom: 16 // for shadow visibility bottom
                            }}>
                                <Text style={{ fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                                    {payout.status}
                                </Text>
                                <Text style={{ fontSize: 28, fontWeight: '800', color: '#0E121A', marginBottom: 12 }}>
                                    {payout.amount === '₹12,500+' ? payout.amount : `₹${payout.amount}`}
                                </Text>
                                <Text style={{ fontSize: 14, color: payout.id === 'next' ? '#F7C846' : '#666' }}>
                                    {payout.date}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Weekly Breakdown */}
                    <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#0E121A' }}>
                        This week
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <TouchableOpacity key={day} style={{
                                width: '30%', // Approx 30% for 3 cols grid
                                backgroundColor: 'white',
                                padding: 16,
                                borderRadius: 16,
                                marginBottom: 12,
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 4
                            }}>
                                <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{day}</Text>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0E121A' }}>₹850</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingBottom: 40,
    }
});
