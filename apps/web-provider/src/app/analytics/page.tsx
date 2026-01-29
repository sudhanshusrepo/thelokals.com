'use client';

import { useEffect, useState } from 'react';
import { useAuth, analyticsService, type ProviderAnalytics, type ProviderEarnings, type CategoryPerformance } from '@thelokals/platform-core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<ProviderAnalytics | null>(null);
    const [earnings, setEarnings] = useState<ProviderEarnings[]>([]);
    const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [analyticsData, earningsData, categoryData] = await Promise.all([
                    analyticsService.getProviderAnalytics(user.id),
                    analyticsService.getProviderEarnings(user.id, period),
                    analyticsService.getProviderCategoryPerformance(user.id)
                ]);

                setAnalytics(analyticsData);
                setEarnings(earningsData);
                setCategoryPerformance(categoryData);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user?.id, period]);

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-gray-500 mt-1">Track your performance and earnings</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Earnings</CardDescription>
                        <CardTitle className="text-2xl">₹{analytics.total_earnings.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">
                            Commission paid: ₹{analytics.total_commission_paid.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Completion Rate</CardDescription>
                        <CardTitle className="text-2xl">{analytics.completion_rate_percent}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">
                            {analytics.completed_jobs} of {analytics.total_jobs} jobs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Average Rating</CardDescription>
                        <CardTitle className="text-2xl">{analytics.avg_rating.toFixed(1)} ⭐</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">
                            {analytics.review_count} reviews
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Active Jobs</CardDescription>
                        <CardTitle className="text-2xl">{analytics.active_jobs}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-gray-500">
                            {analytics.cancelled_jobs} cancelled
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="earnings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="earnings">Earnings</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                <TabsContent value="earnings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Earnings Over Time</CardTitle>
                                    <CardDescription>Your earnings by {period}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {(['day', 'week', 'month', 'year'] as const).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            className={`px-3 py-1 text-sm rounded ${period === p
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {earnings.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No earnings data for this period</p>
                                ) : (
                                    <div className="space-y-2">
                                        {earnings.map((earning, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <div>
                                                    <p className="font-medium">{earning.period_label}</p>
                                                    <p className="text-sm text-gray-500">{earning.job_count} jobs</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">₹{earning.total_earnings.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Avg: ₹{earning.avg_job_value.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance by Category</CardTitle>
                            <CardDescription>Your performance across different service categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {categoryPerformance.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No category data available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {categoryPerformance.map((category, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">{category.category_name}</p>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-sm text-gray-500">{category.job_count} jobs</span>
                                                        <span className="text-sm text-gray-500">
                                                            {category.avg_rating.toFixed(1)} ⭐
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">₹{category.total_earnings.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
