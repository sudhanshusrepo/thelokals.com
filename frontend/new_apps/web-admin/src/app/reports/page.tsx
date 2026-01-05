'use client';

import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
    BarChart3,
    TrendingUp,
    MapPin,
    DollarSign,
    Activity
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAdminData';

export default function ReportsPage() {
    const { analytics: data, isLoading: loading } = useAnalytics();

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-500">Loading analytics...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!data) return null;

    // Use dummy mapping safe check if data structure is unexpected
    const revenueTrend = data.revenueTrend || [];
    const kpis = data.kpis || { totalGMV: 0, totalBookings: 0, avgOrderValue: 0, completionRate: 0 };
    const topCities = data.topCities || [];

    const maxRevenue = Math.max(...revenueTrend.map((d: any) => d.value), 1);

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Executive Dashboard</h1>
                <p className="text-sm text-neutral-500">Key metrics and business intelligence.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                        <Badge variant="success">+12%</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">Total GMV</p>
                    <p className="text-2xl font-bold text-neutral-900">₹{kpis.totalGMV.toLocaleString()}</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <Badge variant="neutral">--</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-neutral-900">{kpis.totalBookings}</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <Badge variant="success">High</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">Avg. Order Value</p>
                    <p className="text-2xl font-bold text-neutral-900">₹{Math.round(kpis.avgOrderValue).toLocaleString()}</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                            <BarChart3 size={24} />
                        </div>
                        <Badge variant={kpis.completionRate > 80 ? 'success' : 'warning'}>{Math.round(kpis.completionRate)}%</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-neutral-900">{Math.round(kpis.completionRate)}%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-neutral-900 mb-6">Revenue Trend</h3>
                    <div className="flex-1 flex items-end justify-between gap-4 h-64">
                        {revenueTrend.map((item: any) => (
                            <div key={item.name} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                                <div
                                    className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative group-hover:shadow-lg"
                                    style={{ height: `${(item.value / maxRevenue) * 100}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        ₹{item.value.toLocaleString()}
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-500 font-medium truncate w-full text-center">{item.name}</p>
                            </div>
                        ))}
                        {revenueTrend.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                No revenue data yet.
                            </div>
                        )}
                    </div>
                </Card>

                {/* Top Cities */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-neutral-100">
                        <h3 className="text-lg font-bold text-neutral-900">Top Cities</h3>
                        <p className="text-sm text-neutral-500">By booking volume</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <tbody className="divide-y divide-neutral-100">
                                {topCities.map((city: any, i: number) => (
                                    <tr key={city.name} className="hover:bg-neutral-50">
                                        <td className="py-4 px-6 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-600">
                                                {i + 1}
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-900">
                                                <MapPin size={14} className="text-neutral-400" />
                                                {city.name}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-neutral-900">
                                            {city.count} bookings
                                        </td>
                                    </tr>
                                ))}
                                {topCities.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="p-8 text-center text-neutral-400">No geo data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
