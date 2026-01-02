import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { adminService } from '@thelocals/core/services/adminService';
import { FinancialMetrics, ProviderPayoutSummary } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import { DollarSign, TrendingUp, Clock, CheckCircle, Search, Download } from 'lucide-react';
import RoleGuard from '../components/RoleGuard';

export default function PaymentsDashboard() {
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [payouts, setPayouts] = useState<ProviderPayoutSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        setLoading(true);
        try {
            const [metricsData, payoutsData] = await Promise.all([
                adminService.getFinancialMetrics(),
                adminService.getProviderPayouts()
            ]);
            setMetrics(metricsData);
            setPayouts(payoutsData);
        } catch (error) {
            toast.error("Failed to load financial data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="card p-6 flex items-start justify-between">
            <div>
                <p className="text-text-tertiary text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-text-primary">
                    {value !== undefined ? `₹${(value / 100).toLocaleString()} ` : '-'}
                </h3>
            </div>
            <div className={`p - 3 rounded - lg bg - ${color} -50 text - ${color} -600`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Financial Overview</h1>
                <p className="text-sm text-text-secondary">Track revenue, provider earnings, and payouts.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={metrics?.totalRevenue}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    title="Provider Earnings"
                    value={metrics?.totalEarnings}
                    icon={DollarSign}
                    color="blue"
                />
                <StatCard
                    title="Pending Payouts"
                    value={metrics?.pendingPayouts}
                    icon={Clock}
                    color="yellow"
                />
                <StatCard
                    title="Completed Payouts"
                    value={metrics?.completedPayouts}
                    icon={CheckCircle}
                    color="purple"
                />
            </div>

            {/* Payouts Table */}
            <div className="card">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="font-bold text-lg text-text-primary">Provider Payouts</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search provider..."
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <button className="btn-secondary">
                            <Download size={16} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Provider</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Earnings</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Paid</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Pending</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-text-secondary">Loading financial data...</td>
                                </tr>
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-text-secondary">No pending payouts found.</td>
                                </tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout.provider_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-6">
                                            <div className="font-medium text-text-primary">{payout.provider_name}</div>
                                            <div className="text-xs text-text-tertiary font-mono">{payout.provider_id.slice(0, 8)}</div>
                                        </td>
                                        <td className="py-3 px-6 text-right font-mono text-sm">
                                            ₹{(payout.total_earnings / 100).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-6 text-right font-mono text-sm text-green-600">
                                            ₹{(payout.paid_amount / 100).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-6 text-right font-mono text-sm text-yellow-600 font-bold">
                                            ₹{(payout.pending_amount / 100).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 uppercase">
                                                Pending
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            {payout.pending_amount > 0 && (
                                                <RoleGuard allowedRoles={['super_admin', 'finance_admin']}>
                                                    <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded">
                                                        Process Payout
                                                    </button>
                                                </RoleGuard>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
