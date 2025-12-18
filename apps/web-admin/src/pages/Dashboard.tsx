import { useEffect, useState } from 'react';
import { supabase, getAdminRole } from '../lib/supabase';
import Link from 'next/link';

interface Stats {
    activeUsers: number;
    activeProviders: number;
    todayBookings: number;
    weekBookings: number;
    monthRevenue: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        activeUsers: 0,
        activeProviders: 0,
        todayBookings: 0,
        weekBookings: 0,
        monthRevenue: 0,
    });
    const [adminRole, setAdminRole] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const role = await getAdminRole();
            setAdminRole(role);

            // Get active users count
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            // Get active providers count
            const { count: providersCount } = await supabase
                .from('providers')
                .select('*', { count: 'exact', head: true })
                .eq('is_available', true);

            // Get today's bookings
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: todayCount } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            // Get week's bookings
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
                activeUsers: usersCount || 0,
                activeProviders: providersCount || 0,
                todayBookings: todayCount || 0,
                weekBookings: weekCount || 0,
                monthRevenue: revenue,
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                                <p className="text-xs text-slate-400">{adminRole?.role || 'Admin'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-6 py-3">
                        <Link href="/" className="text-purple-400 font-semibold border-b-2 border-purple-400 pb-3">
                            Dashboard
                        </Link>
                        <Link href="/locations" className="text-slate-400 hover:text-white transition pb-3">
                            Locations
                        </Link>
                        <Link href="/analytics" className="text-slate-400 hover:text-white transition pb-3">
                            Analytics
                        </Link>
                        <Link href="/audit-logs" className="text-slate-400 hover:text-white transition pb-3">
                            Audit Logs
                        </Link>
                        <Link href="/emergency" className="text-red-400 hover:text-red-300 transition pb-3 font-medium">
                            🚨 Emergency
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Active Users (24h)"
                        value={stats.activeUsers}
                        icon="👥"
                        color="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        title="Active Providers"
                        value={stats.activeProviders}
                        icon="🔧"
                        color="from-green-500 to-emerald-500"
                    />
                    <StatCard
                        title="Today's Bookings"
                        value={stats.todayBookings}
                        icon="📅"
                        color="from-purple-500 to-pink-500"
                    />
                    <StatCard
                        title="Week's Bookings"
                        value={stats.weekBookings}
                        icon="📊"
                        color="from-orange-500 to-red-500"
                    />
                </div>

                {/* Revenue Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Monthly Revenue</p>
                            <p className="text-4xl font-bold text-white">₹{stats.monthRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl">
                            💰
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/locations"
                            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition">
                                    🗺️
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Manage Locations</p>
                                    <p className="text-xs text-slate-400">Control service areas</p>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/analytics"
                            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition">
                                    📈
                                </div>
                                <div>
                                    <p className="font-semibold text-white">View Analytics</p>
                                    <p className="text-xs text-slate-400">Insights & trends</p>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/audit-logs"
                            className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition">
                                    📋
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Audit Logs</p>
                                    <p className="text-xs text-slate-400">Track all changes</p>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/emergency"
                            className="p-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/30 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition">
                                    🚨
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Emergency Controls</p>
                                    <p className="text-xs text-red-400">Rapid shutdown</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-sm">{title}</p>
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-xl`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
