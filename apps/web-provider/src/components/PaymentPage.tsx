import React, { useState, useEffect } from 'react';

interface Payment {
    id: string;
    bookingId: string;
    serviceName: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    date: Date;
    clientName: string;
}

interface PaymentStats {
    totalEarnings: number;
    pendingPayments: number;
    thisWeek: number;
    thisMonth: number;
}

const PaymentPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats>({
        totalEarnings: 0,
        pendingPayments: 0,
        thisWeek: 0,
        thisMonth: 0
    });
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

    useEffect(() => {
        // Mock data - replace with Supabase query
        const mockPayments: Payment[] = [
            {
                id: '1',
                bookingId: 'B001',
                serviceName: 'Leak Repair',
                amount: 425,
                status: 'completed',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                clientName: 'Rajesh Kumar'
            },
            {
                id: '2',
                bookingId: 'B002',
                serviceName: 'Fan Installation',
                amount: 680,
                status: 'pending',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                clientName: 'Priya Sharma'
            },
            {
                id: '3',
                bookingId: 'B003',
                serviceName: 'Electrical Wiring',
                amount: 1200,
                status: 'completed',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                clientName: 'Mohammed Ali'
            }
        ];

        setPayments(mockPayments);

        // Calculate stats
        const total = mockPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const pending = mockPayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekTotal = mockPayments
            .filter(p => p.status === 'completed' && p.date.getTime() > weekAgo)
            .reduce((sum, p) => sum + p.amount, 0);

        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const monthTotal = mockPayments
            .filter(p => p.status === 'completed' && p.date.getTime() > monthAgo)
            .reduce((sum, p) => sum + p.amount, 0);

        setStats({
            totalEarnings: total,
            pendingPayments: pending,
            thisWeek: weekTotal,
            thisMonth: monthTotal
        });
    }, []);

    const filteredPayments = payments.filter(p =>
        filter === 'all' ? true : p.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Payments</h1>
                <p className="text-slate-600">Track your earnings and payment history</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg">
                    <p className="text-blue-100 text-sm font-semibold mb-2">Total Earnings</p>
                    <p className="text-4xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-yellow-200">
                    <p className="text-slate-600 text-sm font-semibold mb-2">Pending Payments</p>
                    <p className="text-3xl font-bold text-yellow-600">₹{stats.pendingPayments.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-slate-600 text-sm font-semibold mb-2">This Week</p>
                    <p className="text-3xl font-bold text-slate-900">₹{stats.thisWeek.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-slate-600 text-sm font-semibold mb-2">This Month</p>
                    <p className="text-3xl font-bold text-slate-900">₹{stats.thisMonth.toLocaleString()}</p>
                </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Withdrawal</h3>
                        <p className="text-slate-600 mb-4">
                            Available balance: <span className="font-bold text-blue-200">₹{stats.totalEarnings.toLocaleString()}</span>
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md">
                        Withdraw Funds
                    </button>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                    <p>💡 Withdrawals are processed within 2-3 business days</p>
                    <p>💡 Minimum withdrawal amount: ₹500</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'completed', 'pending', 'failed'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${filter === status
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && (
                            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                {payments.filter(p => p.status === status).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
                </div>

                {filteredPayments.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No {filter !== 'all' && filter} payments</h3>
                        <p className="text-slate-600">Your payment history will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredPayments.map(payment => (
                            <div key={payment.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-slate-900">{payment.serviceName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span>Booking #{payment.bookingId}</span>
                                            <span>•</span>
                                            <span>👤 {payment.clientName}</span>
                                            <span>•</span>
                                            <span>📅 {payment.date.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">₹{payment.amount}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Bank Account Details</h2>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Account Holder:</span>
                        <span className="font-semibold text-slate-900">John Doe</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Account Number:</span>
                        <span className="font-semibold text-slate-900">****1234</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">IFSC Code:</span>
                        <span className="font-semibold text-slate-900">HDFC0001234</span>
                    </div>
                </div>
                <button className="mt-4 text-primary font-semibold hover:underline">
                    Update Bank Details →
                </button>
            </div>
        </div>
    );
};

export { PaymentPage };
export default PaymentPage;
