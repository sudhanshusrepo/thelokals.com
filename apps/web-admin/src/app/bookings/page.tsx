'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import {
    Calendar,
    Search,
    Filter,
    MoreHorizontal,
    User,
    Clock,
    MapPin,
    DollarSign,
    AlertCircle,
    Truck,
    XCircle,
    MoreVertical
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Booking, BookingStatus, WorkerProfile } from "@thelocals/platform-core";
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useAdminData';

export default function BookingsPage() {
    const { adminUser } = useAuth();
    const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
    const { bookings, isLoading: loading, mutate } = useBookings(statusFilter === 'ALL' ? undefined : statusFilter);
    const [searchQuery, setSearchQuery] = useState('');

    // Action State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'assign' | 'cancel' | 'complete' | null>(null);
    const [providers, setProviders] = useState<WorkerProfile[]>([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [actionNote, setActionNote] = useState('');

    const handleActionClick = async (booking: Booking, type: 'assign' | 'cancel' | 'complete') => {
        setSelectedBooking(booking);
        setActionType(type);
        setIsActionModalOpen(true);

        if (type === 'assign' && providers.length === 0) {
            try {
                const p = await adminService.getAllProviders('approved');
                setProviders(p);
            } catch (e) {
                toast.error("Could not load providers");
            }
        }
    };

    const submitAction = async () => {
        if (!selectedBooking || !actionType) return;
        if (!adminUser) return;

        try {
            if (actionType === 'assign') {
                if (!selectedProviderId) return toast.error("Select a provider");
                await adminService.updateBooking(selectedBooking.id, {
                    provider_id: selectedProviderId,
                    status: 'CONFIRMED' as any
                });
                toast.success("Provider assigned");
            } else if (actionType === 'cancel') {
                await adminService.updateBooking(selectedBooking.id, {
                    status: 'CANCELLED' as any,
                    notes: actionNote ? `${selectedBooking.notes || ''}\nAdmin Note: ${actionNote}` : undefined
                });
                toast.success("Booking cancelled");
            } else if (actionType === 'complete') {
                await adminService.updateBooking(selectedBooking.id, {
                    status: 'COMPLETED' as any,
                    completed_at: new Date().toISOString()
                });
                toast.success("Booking marked as complete");
            }

            setIsActionModalOpen(false);
            resetActionState();
            mutate();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const resetActionState = () => {
        setSelectedBooking(null);
        setActionType(null);
        setSelectedProviderId('');
        setActionNote('');
    };

    const getStatusBadge = (status: string) => {
        const map: any = {
            'REQUESTED': 'warning',
            'CONFIRMED': 'info',
            'IN_PROGRESS': 'info',
            'COMPLETED': 'success',
            'CANCELLED': 'error'
        };
        return <Badge variant={map[status] || 'neutral'}>{status?.replace('_', ' ')}</Badge>;
    };

    const filteredBookings = bookings.filter(b =>
        searchQuery ? (
            b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.worker?.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) : true
    );

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Mission Control</h1>
                    <p className="text-sm text-neutral-500">Real-time booking management and oversight.</p>
                </div>
            </div>

            {/* Metrics Summary Placeholder - Ideally strictly derived from full counts, but here we use current view */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-blue-50 border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase">Active Jobs</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{bookings.filter(b => b.status === 'IN_PROGRESS').length}</p>
                </Card>
                <Card className="p-4 bg-yellow-50 border-yellow-100">
                    <p className="text-xs font-semibold text-yellow-600 uppercase">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{bookings.filter(b => b.status === 'REQUESTED').length}</p>
                </Card>
                <Card className="p-4 bg-green-50 border-green-100">
                    <p className="text-xs font-semibold text-green-600 uppercase">Completed Today</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{bookings.filter(b => b.status === 'COMPLETED' && new Date(b.created_at).getDate() === new Date().getDate()).length}</p>
                </Card>
                <Card className="p-4 bg-neutral-50 border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-600 uppercase">Total Value</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">₹{bookings.reduce((sum, b) => sum + (b.final_cost || b.estimated_cost || 0), 0).toLocaleString()}</p>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-neutral-200 mb-6 overflow-x-auto">
                <div className="flex gap-6 min-w-max">
                    {(['ALL', 'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab as any)}
                            className={`pb-3 text-sm font-medium transition-colors relative ${statusFilter === tab
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Booking ID</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Service</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Customer</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Provider</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Schedule</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-neutral-500">Loading bookings...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-neutral-500">No bookings found.</td></tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-4 font-mono text-xs text-neutral-500">
                                            {booking.id.slice(0, 8)}...
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-neutral-900 text-sm">{booking.service_category}</p>
                                            <p className="text-xs text-neutral-500">₹{booking.final_cost || booking.estimated_cost}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs">
                                                    <User size={12} />
                                                </div>
                                                <span className="text-sm text-neutral-900">{booking.user?.name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {booking.worker ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs">
                                                        <Truck size={12} />
                                                    </div>
                                                    <span className="text-sm text-neutral-900">{booking.worker.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-neutral-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-neutral-400" />
                                                <span>{booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : 'ASAP'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {booking.status === 'REQUESTED' && (
                                                    <button onClick={() => handleActionClick(booking, 'assign')} className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-hover">
                                                        Assign
                                                    </button>
                                                )}
                                                {booking.status === 'IN_PROGRESS' && (
                                                    <button onClick={() => handleActionClick(booking, 'complete')} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                                                        Done
                                                    </button>
                                                )}
                                                {['REQUESTED', 'CONFIRMED'].includes(booking.status) && (
                                                    <button onClick={() => handleActionClick(booking, 'cancel')} className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded">
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                                <button className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 rounded">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Actions Modal */}
            {isActionModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4 capitalize">
                            {actionType === 'assign' ? 'Assign Provider' : actionType} Booking
                        </h3>

                        {actionType === 'assign' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-neutral-700">Select Provider</label>
                                <select
                                    className="w-full p-2 border border-neutral-300 rounded-lg"
                                    value={selectedProviderId}
                                    onChange={(e) => setSelectedProviderId(e.target.value)}
                                >
                                    <option value="">-- Choose --</option>
                                    {providers.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {actionType === 'cancel' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-neutral-700">Cancellation Note</label>
                                <textarea
                                    className="w-full p-2 border border-neutral-300 rounded-lg h-24"
                                    placeholder="Reason for cancellation..."
                                    value={actionNote}
                                    onChange={e => setActionNote(e.target.value)}
                                />
                            </div>
                        )}

                        {actionType === 'complete' && (
                            <p className="text-neutral-600 mb-4">Are you sure you want to mark this booking as completed? This will trigger final billing.</p>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsActionModalOpen(false)} className="flex-1 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Cancel</button>
                            <button onClick={submitAction} className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium capitalize">
                                Confirm {actionType}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
