import React from 'react';
import { Booking } from '@thelocals/core';

interface PaymentsTabProps {
    bookings: Booking[];
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ bookings }) => {
    // Filter for completed/paid bookings for earnings
    const paidBookings = bookings.filter(b => b.payment_status === 'PAID');
    const pendingBookings = bookings.filter(b => b.status === 'COMPLETED' && b.payment_status !== 'PAID');

    // Calculate totals
    // Fallback to 85% of total_price if provider_earnings is not set (legacy data)
    const totalEarnings = paidBookings.reduce((acc, b) => {
        const earning = b.provider_earnings || ((b.final_cost || b.estimated_cost || 0) * 0.85);
        return acc + earning;
    }, 0);

    const pendingPayout = pendingBookings.reduce((acc, b) => {
        const earning = b.provider_earnings || ((b.final_cost || b.estimated_cost || 0) * 0.85);
        return acc + earning;
    }, 0);

    const completedJobsCount = bookings.filter(b => b.status === 'COMPLETED').length;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Earnings Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Earnings</div>
                    <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalEarnings)}</div>
                    <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <span>↗</span> All time
                    </div>
                </div>

                {/* Pending Payout Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-1">Pending Payout</div>
                    <div className="text-3xl font-bold text-amber-600">{formatCurrency(pendingPayout)}</div>
                    <div className="text-xs text-slate-400 mt-2">
                        Clears in ~2 days
                    </div>
                </div>

                {/* Jobs Stats Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-sm font-medium mb-1">Jobs Completed</div>
                    <div className="text-3xl font-bold text-slate-900">{completedJobsCount}</div>
                    <div className="text-xs text-slate-400 mt-2">
                        Lifetime
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Transaction History</h3>
                    <button className="text-sm text-primary font-medium hover:underline">Download Statement</button>
                </div>

                <div className="divide-y divide-slate-100">
                    {bookings
                        .filter(b => b.status === 'COMPLETED')
                        .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
                        .map(booking => {
                            const amount = booking.final_cost || booking.estimated_cost || 0;
                            const earning = booking.provider_earnings || (amount * 0.85);
                            const isPaid = booking.payment_status === 'PAID';

                            return (
                                <div key={booking.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isPaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {isPaid ? '✓' : '⏳'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{booking.user?.name || 'Client'}</div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(booking.completed_at)} • {booking.service_category}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">{formatCurrency(earning)}</div>
                                        <div className="text-xs text-slate-400">Total: {formatCurrency(amount)}</div>
                                    </div>
                                </div>
                            );
                        })}

                    {bookings.filter(b => b.status === 'COMPLETED').length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            No transactions yet. Complete your first job!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
