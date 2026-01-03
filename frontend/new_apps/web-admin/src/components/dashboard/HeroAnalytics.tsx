'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ArrowUp, ArrowDown, Users, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { AdminDashboardMetrics } from '@thelocals/core/types';

interface HeroAnalyticsProps {
    stats?: AdminDashboardMetrics;
    loading?: boolean;
}

interface StatBoxProps {
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    icon: any;
    color: string;
}

const StatBox = ({ label, value, trend, trendValue, icon: Icon, color }: StatBoxProps) => (
    <div className="flex flex-col gap-1 p-4 rounded-xl hover:bg-neutral-50 transition-colors bg-white border border-neutral-100 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-neutral-500 text-sm font-medium">{label}</span>
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                <Icon size={18} />
            </div>
        </div>
        <div className="mt-2">
            <span className="text-2xl font-bold text-neutral-900">{value}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <ArrowUp size={14} className="text-primary" />}
            {trend === 'down' && <ArrowDown size={14} className="text-error" />}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-primary' : trend === 'down' ? 'text-error' : 'text-neutral-500'}`}>
                {trendValue}
            </span>
            <span className="text-xs text-neutral-400 ml-1">vs last period</span>
        </div>
    </div>
);

export const HeroAnalytics = ({ stats, loading }: HeroAnalyticsProps) => {
    const [view, setView] = useState<'bookings' | 'revenue'>('bookings');

    if (loading || !stats) {
        return <div className="animate-pulse bg-neutral-100 w-full h-96 rounded-xl"></div>;
    }

    const {
        activeListings,
        newUsers,
        totalBookings,
        totalRevenue,
        activeListingsChangePercentage,
        newUsersChangePercentage,
        bookingsChangePercentage,
        revenueChangePercentage,
        chartData
    } = stats;

    const formatTrend = (val: number) => `${val > 0 ? '+' : ''}${val}%`;
    const getTrendDir = (val: number) => val > 0 ? 'up' : val < 0 ? 'down' : 'neutral';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 w-full">
            {/* ... header ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">Platform Overview</h2>
                    <p className="text-sm text-neutral-500">Track your key marketplace metrics</p>
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setView('bookings')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'bookings' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setView('revenue')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'revenue' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Revenue
                    </button>
                </div>
            </div>

            {/* Top Stats Row - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatBox
                    label="Active Listings"
                    value={activeListings.toLocaleString()}
                    trend={getTrendDir(activeListingsChangePercentage)}
                    trendValue={formatTrend(activeListingsChangePercentage)}
                    icon={ShoppingBag}
                    color="indigo"
                />
                <StatBox
                    label="New Users"
                    value={newUsers.toLocaleString()}
                    trend={getTrendDir(newUsersChangePercentage)}
                    trendValue={formatTrend(newUsersChangePercentage)}
                    icon={Users}
                    color="purple"
                />
                <StatBox
                    label="Total Bookings"
                    value={totalBookings.toLocaleString()}
                    trend={getTrendDir(bookingsChangePercentage)}
                    trendValue={formatTrend(bookingsChangePercentage)}
                    icon={Calendar}
                    color="amber"
                />
                <StatBox
                    label="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    trend={getTrendDir(revenueChangePercentage)}
                    trendValue={formatTrend(revenueChangePercentage)}
                    icon={DollarSign}
                    color="emerald"
                />
            </div>

            {/* Main Chart */}
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={view === 'bookings' ? '#3B82F6' : '#10B981'} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={view === 'bookings' ? '#3B82F6' : '#10B981'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={view}
                            stroke={view === 'bookings' ? '#3B82F6' : '#10B981'}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
