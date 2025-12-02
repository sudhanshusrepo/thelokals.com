import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { Booking } from '@thelocals/core/types';
import { Layout } from '../components/Layout';

export const LiveJobs: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();

        // WebSocket subscription for real-time booking updates
        const channel = supabase
            .channel('live-bookings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    console.log('Booking update:', payload);

                    if (payload.eventType === 'INSERT') {
                        setBookings(prev => [payload.new as Booking, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setBookings(prev => prev.map(b =>
                            b.id === (payload.new as Booking).id ? payload.new as Booking : b
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .in('status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const statusCounts = {
        PENDING: bookings.filter(b => b.status === 'PENDING').length,
        CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
        IN_PROGRESS: bookings.filter(b => b.status === 'IN_PROGRESS').length,
    };

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Live Active Jobs</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Active"
                        count={bookings.length}
                        color="indigo"
                    />
                    <StatCard
                        title="Pending"
                        count={statusCounts.PENDING}
                        color="yellow"
                    />
                    <StatCard
                        title="Confirmed"
                        count={statusCounts.CONFIRMED}
                        color="blue"
                    />
                    <StatCard
                        title="In Progress"
                        count={statusCounts.IN_PROGRESS}
                        color="green"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-2">
                        {(['all', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bookings Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">No active jobs found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Booking ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            {booking.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {booking.booking_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.service_category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{booking.estimated_cost || '-'}
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-green-100 text-green-800',
        COMPLETED: 'bg-gray-100 text-gray-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

interface StatCardProps {
    title: string;
    count: number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, color }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{count}</p>
        </div>
    );
};
