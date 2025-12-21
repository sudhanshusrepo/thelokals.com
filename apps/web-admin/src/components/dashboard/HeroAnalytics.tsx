import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { ArrowUp, ArrowDown, Users, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface HeroAnalyticsProps {
    stats?: {
        activeListings: number;
        newUsers: number;
        totalBookings: number;
        revenue: number;
    };
    loading?: boolean;
}

// Mock Data
const data = [
    { name: 'Mon', bookings: 40, revenue: 2400 },
    { name: 'Tue', bookings: 30, revenue: 1398 },
    { name: 'Wed', bookings: 20, revenue: 9800 },
    { name: 'Thu', bookings: 27, revenue: 3908 },
    { name: 'Fri', bookings: 18, revenue: 4800 },
    { name: 'Sat', bookings: 23, revenue: 3800 },
    { name: 'Sun', bookings: 34, revenue: 4300 },
];

const StatBox = ({ label, value, trend, trendValue, icon: Icon, color }: any) => (
    <div className="flex flex-col gap-1 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm font-medium">{label}</span>
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
                <Icon size={18} />
            </div>
        </div>
        <div className="mt-2">
            <span className="text-2xl font-bold text-text-primary">{value}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
            {trend === 'up' ? (
                <ArrowUp size={14} className="text-primary" />
            ) : (
                <ArrowDown size={14} className="text-danger" />
            )}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-primary' : 'text-danger'}`}>
                {trendValue}
            </span>
            <span className="text-xs text-text-tertiary ml-1">vs last month</span>
        </div>
    </div>
);

export const HeroAnalytics = ({ stats, loading }: HeroAnalyticsProps) => {
    const [view, setView] = useState<'bookings' | 'revenue'>('bookings');

    // Use passed stats or defaults (0) to avoid errors if undefined
    const activeListings = stats?.activeListings || 0;
    const newUsers = stats?.newUsers || 0;
    const totalBookings = stats?.totalBookings || 0;
    const revenue = stats?.revenue || 0;

    return (
        <div className="card w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-text-primary">Platform Overview</h2>
                    <p className="text-sm text-text-secondary">Track your key marketplace metrics</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setView('bookings')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'bookings' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setView('revenue')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'revenue' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Revenue
                    </button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatBox
                    label="Active Listings"
                    value={activeListings.toLocaleString()} // Use real data
                    trend="up"
                    trendValue="+12%" // Keeping static for now as trend data isn't passed yet
                    icon={ShoppingBag}
                    color="blue"
                />
                <StatBox
                    label="New Users"
                    value={newUsers.toLocaleString()} // Use real data
                    trend="up"
                    trendValue="+5%"
                    icon={Users}
                    color="purple"
                />
                <StatBox
                    label="Total Bookings"
                    value={totalBookings.toLocaleString()} // Use real data
                    trend="down"
                    trendValue="-2%"
                    icon={Calendar}
                    color="orange"
                />
                <StatBox
                    label="Total Revenue"
                    value={`₹${revenue.toLocaleString()}`} // Use real data
                    trend="up"
                    trendValue="+8.5%"
                    icon={DollarSign}
                    color="green"
                />
            </div>

            {/* Main Chart */}
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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

            {/* Bottom Mini Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                    <p className="text-xs text-text-tertiary uppercase font-semibold">Conversion Rate</p>
                    <p className="text-xl font-bold text-text-primary mt-1">3.2%</p>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">+0.4%</span>
                </div>
                <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-text-tertiary uppercase font-semibold">Avg Booking Value</p>
                    <p className="text-xl font-bold text-text-primary mt-1">₹850</p>
                    <span className="text-xs text-text-secondary inline-block mt-1">Stable</span>
                </div>
                <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-text-tertiary uppercase font-semibold">Repeat Rate</p>
                    <p className="text-xl font-bold text-text-primary mt-1">42%</p>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">+2%</span>
                </div>
                <div className="text-center border-l border-gray-100">
                    <p className="text-xs text-text-tertiary uppercase font-semibold">Cancellation Rate</p>
                    <p className="text-xl font-bold text-text-primary mt-1">1.8%</p>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">-0.2%</span>
                </div>
            </div>
        </div>
    );
};
