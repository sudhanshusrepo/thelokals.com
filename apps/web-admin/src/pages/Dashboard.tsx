import { AdminLayout } from '../components/layout/AdminLayout';
import { HeroAnalytics } from '../components/dashboard/HeroAnalytics';
import { OperationalWidgets } from '../components/dashboard/OperationalWidgets';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const [stats, setStats] = useState({
        activeListings: 0,
        newUsers: 0,
        totalBookings: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Get active users count (last 24h as proxy for "New" or just total active)
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            // Get active providers count (Active Listings)
            const { count: providersCount } = await supabase
                .from('providers')
                .select('*', { count: 'exact', head: true })
                .eq('is_available', true);

            // Get total bookings (Using week bookings for now as a dynamic metric demo)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const { count: weekCount } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', weekAgo.toISOString());

            // Get month's revenue
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const { data: revenueData } = await supabase
                .from('bookings')
                .select('final_cost')
                .eq('status', 'COMPLETED')
                .gte('created_at', monthAgo.toISOString());

            const revenue = revenueData?.reduce((sum: number, b: any) => sum + (Number(b.final_cost) || 0), 0) || 0;

            setStats({
                activeListings: providersCount || 0,
                newUsers: usersCount || 0,
                totalBookings: weekCount || 0,
                revenue: revenue,
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                    <p className="text-sm text-text-secondary">Welcome back, here's what's happening today.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-white border border-gray-200 rounded-lg p-1">
                        <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-text-primary rounded-md shadow-sm">Today</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary">7D</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary">30D</button>
                        <button className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary">Custom</button>
                    </div>
                    <button className="btn-primary shadow-lg shadow-primary/20">
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

                {/* Secondary Section: Top Categories & Local Partners (Placeholder for now layout-wise) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="font-bold text-text-primary mb-4">Top Categories</h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <span className="text-sm text-text-tertiary">Category Performance Chart</span>
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text-primary">Top Partners</h3>
                            <button className="text-sm text-primary hover:text-primary-hover font-medium">View all</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Partner</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3 text-right">Revenue</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-text-primary">Partner {i}</td>
                                            <td className="px-4 py-3 text-text-secondary">Indirapuram</td>
                                            <td className="px-4 py-3 text-right text-text-primary font-medium">₹12,4{i}0</td>
                                            <td className="px-4 py-3 text-right text-green-600 font-medium">4.8</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
