import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '@thelocals/core/services/adminService';
import { Booking } from '@thelocals/core/types';
import { Filter, Calendar, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function BookingsIndex() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        page: 0,
        limit: 20
    });
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadBookings();
    }, [filters.status, filters.page]);

    const loadBookings = async () => {
        setLoading(true);
        try {
            // Need to map filters correctly. 'All' status should be undefined.
            const queryFilters = {
                status: filters.status === 'ALL' ? undefined : filters.status || undefined,
                page: filters.page,
                limit: filters.limit
            };

            const { data, count } = await adminService.getBookings(queryFilters);
            setBookings(data);
            setTotalCount(count);
        } catch (error) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Bookings</h1>
                    <p className="text-sm text-text-secondary">Monitor and manage service requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ID..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                    <button className="btn-secondary">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                    <button className="btn-secondary">
                        <Calendar size={18} />
                        <span>Date</span>
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilters({ ...filters, status: status === 'ALL' ? '' : status, page: 0 })}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${(filters.status === status || (status === 'ALL' && !filters.status))
                                ? 'bg-primary text-white'
                                : 'bg-white text-text-secondary hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">ID & Date</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Service</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Customer</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Provider</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Amount</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-text-secondary">Loading bookings...</td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-text-secondary">No bookings found matching filters.</td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs text-text-secondary">#{booking.id.slice(0, 8)}</span>
                                                <span className="text-xs text-text-tertiary">
                                                    {new Date(booking.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-medium text-text-primary text-sm">
                                                {booking.service_category || 'Service'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                                    {(booking.user?.name || 'U')[0]}
                                                </div>
                                                <span className="text-sm text-text-secondary truncate max-w-[100px]">
                                                    {booking.user?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {booking.worker ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs text-purple-600">
                                                        {booking.worker.name[0]}
                                                    </div>
                                                    <span className="text-sm text-text-secondary truncate max-w-[100px]">
                                                        {booking.worker.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-tertiary italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-sm">
                                            ₹{(booking.final_cost || booking.estimated_cost || 0) / 100}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link href={`/bookings/${booking.id}`} className="inline-flex p-1 text-text-secondary hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <span className="text-xs text-text-secondary">
                        Showing {bookings.length} of {totalCount} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={filters.page === 0}
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={(filters.page + 1) * filters.limit >= totalCount}
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
