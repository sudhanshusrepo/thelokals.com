import React, { useEffect, useState } from 'react';
import { adminService } from '@thelocals/core/services/adminService';
import { ActiveSession } from '@thelocals/core/types';
import { Layout } from '../components/Layout';

export const LiveUsers: React.FC = () => {
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [filters, setFilters] = useState({ city: '', userType: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessions();

        // WebSocket subscription for real-time updates
        const channel = adminService.subscribeToActiveSessions((payload) => {
            console.log('Session update:', payload);

            if (payload.eventType === 'INSERT') {
                setSessions(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setSessions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
            } else if (payload.eventType === 'DELETE') {
                setSessions(prev => prev.filter(s => s.id !== payload.old.id));
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [filters]);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const data = await adminService.getActiveSessions(
                filters.city || filters.userType ? filters : undefined
            );
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const customerCount = sessions.filter(s => s.user_type === 'customer').length;
    const providerCount = sessions.filter(s => s.user_type === 'provider').length;

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Live Active Users</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Active Customers"
                        count={customerCount}
                        icon="👥"
                        color="blue"
                    />
                    <StatCard
                        title="Active Providers"
                        count={providerCount}
                        icon="🔧"
                        color="green"
                    />
                    <StatCard
                        title="Total Active"
                        count={sessions.length}
                        icon="📊"
                        color="purple"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Filter by city..."
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Type
                            </label>
                            <select
                                value={filters.userType}
                                onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Types</option>
                                <option value="customer">Customers</option>
                                <option value="provider">Providers</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={loadSessions}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sessions Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">No active sessions found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        City
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        State
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {session.user_id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${session.user_type === 'customer'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {session.user_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {session.city || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {session.session_state || 'active'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(session.last_activity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

interface StatCardProps {
    title: string;
    count: number;
    icon: string;
    color: 'blue' | 'green' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
                </div>
                <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};
