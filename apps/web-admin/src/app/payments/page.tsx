'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from "@thelocals/platform-core";
import { toast } from 'react-hot-toast';
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    Download,
    CheckCircle,
    Clock,
    User
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { useAuth } from '../../contexts/AuthContext';

import { useFinancials, useBookings } from '../../hooks/useAdminData';

export default function PaymentsPage() {
    const { adminUser } = useAuth();
    const { stats, payouts, isLoading: financialsLoading, mutatePayouts } = useFinancials();
    const { bookings: ledger, isLoading: ledgerLoading } = useBookings();

    const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'LEDGER'>('PAYOUTS');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const loading = financialsLoading || ledgerLoading;

    // Removed manual loadData/useEffect

    const handleProcessPayout = async (providerId: string, bookingIds: string[]) => {
        if (!adminUser) return;
        setProcessingId(providerId);
        try {
            // In a real app, this would trigger Stripe Connect or similar
            await adminService.processPayout(bookingIds, adminUser.id);
            toast.success("Payout marked as processed");
            mutatePayouts(); // Refresh SWR
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleExportCSV = () => {
        toast.success("CSV Download Started (Demo)");
        // Logic to generate CSV blob
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Financial Operations</h1>
                    <p className="text-sm text-neutral-500">Manage provider payouts and track commissions.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
                >
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-neutral-900">₹{stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Platform Commission</p>
                            <p className="text-2xl font-bold text-neutral-900">₹{stats.totalCommission.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Pending Payouts</p>
                            <p className="text-2xl font-bold text-neutral-900">₹{stats.pendingPayouts.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content Tabs */}
            <div className="mb-6">
                <div className="flex border-b border-neutral-200">
                    <button
                        onClick={() => setActiveTab('PAYOUTS')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'PAYOUTS' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        Pending Payouts
                    </button>
                    <button
                        onClick={() => setActiveTab('LEDGER')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'LEDGER' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        Commission Ledger
                    </button>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                {activeTab === 'PAYOUTS' ? (
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Provider</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Bookings</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Total Amount</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-neutral-500">Loading payouts...</td></tr>
                            ) : payouts.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-neutral-500">No pending payouts.</td></tr>
                            ) : (
                                payouts.map((p) => (
                                    <tr key={p.provider.id} className="hover:bg-neutral-50/50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-medium">
                                                    {p.provider.name?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{p.provider.name}</p>
                                                    <p className="text-xs text-neutral-500">{p.provider.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-neutral-600">
                                            {p.count} bookings
                                        </td>
                                        <td className="py-4 px-6 font-mono text-neutral-900 font-medium">
                                            ₹{p.amount.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleProcessPayout(p.provider.id, p.bookingIds)}
                                                disabled={processingId === p.provider.id}
                                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {processingId === p.provider.id ? 'Processing...' : 'Mark as Paid'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Type</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Ref ID</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Date</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Amount</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Provider Fees</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {ledger.map((booking) => (
                                <tr key={booking.id} className="hover:bg-neutral-50/50">
                                    <td className="py-4 px-6">
                                        <Badge variant="neutral">Booking</Badge>
                                    </td>
                                    <td className="py-4 px-6 font-mono text-xs text-neutral-500">
                                        {booking.id.slice(0, 8)}...
                                    </td>
                                    <td className="py-4 px-6 text-sm text-neutral-600">
                                        {new Date(booking.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <Badge variant={booking.payment_status === 'PAID' ? 'success' : 'warning'}>{booking.payment_status}</Badge>
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-sm text-neutral-900">
                                        ₹{booking.final_cost || 0}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-sm text-red-600">
                                        - ₹{booking.provider_earnings || 0}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-sm text-green-600 font-medium">
                                        + ₹{booking.platform_commission || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </AdminLayout>
    );
}
