'use client';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { HeroAnalytics } from '../../components/dashboard/HeroAnalytics';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '@thelocals/core/services/adminService';
import { AdminDashboardMetrics } from '@thelocals/core/types';

// Stub components to prevent build errors until migrated
const OperationalWidgets = () => <div className="p-4 bg-white rounded-xl border border-neutral-100 mb-6 text-center text-neutral-400">Operational Widgets Placeholder</div>;
const SystemHealth = () => <div className="p-4 bg-white rounded-xl border border-neutral-100 mb-6 text-center text-neutral-400">System Health Placeholder</div>;

export default function DashboardPage() {
    const [stats, setStats] = useState<AdminDashboardMetrics | undefined>(undefined);
    const [recentProviders, setRecentProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7d' | '30d' | 'custom'>('7d');

    useEffect(() => {
        loadDashboardData(selectedPeriod);
    }, [selectedPeriod]);

    const loadDashboardData = async (period: 'today' | '7d' | '30d' | 'custom') => {
        setLoading(true);
        try {
            // Parallel fetch
            const [metrics, providers] = await Promise.all([
                adminService.getDashboardMetrics(period),
                adminService.getAllProviders() // fetches all, we'll slice client side for now
            ]);

            setStats(metrics as AdminDashboardMetrics);
            // Sort by created_at desc if possible, or just take first 5
            setRecentProviders(providers.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Use fallback data instead of staying in loading state
            setStats({
                activeListings: 0,
                newUsers: 0,
                totalBookings: 0,
                totalRevenue: 0,
                revenueChangePercentage: 0,
                bookingsChangePercentage: 0,
                newUsersChangePercentage: 0,
                activeListingsChangePercentage: 0,
                chartData: []
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
                    <p className="text-sm text-neutral-500">Welcome back, here's what's happening today.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-white border border-neutral-200 rounded-lg p-1">
                        {(['today', '7d', '30d'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedPeriod === period
                                    ? 'bg-neutral-100 text-neutral-900 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-900'
                                    }`}
                            >
                                {period === 'today' ? 'Today' : period.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-lg shadow-primary/20">
                        <Plus size={18} />
                        <span>Add Listing</span>
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Hero Analytics Section */}
                <HeroAnalytics stats={stats} loading={loading} />

                {/* Operational Widgets */}
                <OperationalWidgets />

                {/* System Health Monitoring */}
                <SystemHealth />

                {/* Secondary Section: Top Categories & Partners - Responsive */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-neutral-900 mb-4">Top Categories</h3>
                        {/* Placeholder for now as we don't have category aggregation stats yet */}
                        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                            <span className="text-sm text-neutral-400">Category Performance Chart (Coming Soon)</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-neutral-900">Recent Partners</h3>
                            <button className="text-sm text-primary hover:text-primary-hover font-medium">View all</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Partner</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Joined</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {loading ? (
                                        <tr>
                                            <td className="px-4 py-3 text-neutral-500" colSpan={4}>Loading data...</td>
                                        </tr>
                                    ) : recentProviders.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-3 text-neutral-500" colSpan={4}>No partners found.</td>
                                        </tr>
                                    ) : (
                                        recentProviders.map((p) => (
                                            <tr key={p.id} className="hover:bg-neutral-50/50">
                                                <td className="px-4 py-3 font-medium text-neutral-900">{p.full_name || 'Unnamed'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {p.is_verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-neutral-500 text-xs">
                                                    {new Date(p.created_at || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-success font-medium">{p.rating || 'New'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
