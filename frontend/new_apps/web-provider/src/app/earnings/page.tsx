
'use client';

import { useAuth } from '../../contexts/AuthContext';
import { ProviderLayout } from '../../components/layout/ProviderLayout';
import { useEffect, useState } from 'react';
import { providerService } from '@thelocals/core/services/providerService';
import { HeroCard } from '../../components/v2/HeroCard';
import { TransactionList } from '../../components/v2/TransactionList';
import { Loader2, TrendingUp, CreditCard, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const EarningsChart = dynamic(() => import('../../components/v2/EarningsChart').then(mod => mod.EarningsChart), {
    loading: () => <div className="h-[300px] w-full bg-neutral-50 animate-pulse rounded-card" />,
    ssr: false
});

export default function EarningsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        monthlyEarnings: 0,
        currentBalance: 0,
        trend: 12
    });
    const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        if (user?.id) {
            loadEarningsData(user.id);
        }
    }, [user]);

    const loadEarningsData = async (userId: string) => {
        setLoading(true);
        try {
            const [providerStats, history, txs] = await Promise.all([
                providerService.getDashboardStats(userId),
                providerService.getEarningsHistory(userId, 'week'),
                providerService.getTransactions(userId)
            ]);

            setStats({
                monthlyEarnings: providerStats.monthlyEarnings,
                currentBalance: providerStats.currentBalance,
                trend: 15 // Mock trend
            });
            setChartData(history);
            setTransactions(txs as any);
        } catch (error) {
            toast.error("Failed to load earnings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProviderLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Earnings</h1>
                    <p className="text-neutral-500">Track your revenue and payouts.</p>
                </div>
                <button className="bg-white border border-neutral-200 text-neutral-900 font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors">
                    <CreditCard size={16} /> Payout Settings
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p>Loading finances...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Hero Card */}
                    {/* Payout Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">Pending</p>
                                <p className="text-xl font-bold text-yellow-900">₹{stats.currentBalance.toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <Clock size={20} />
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Paid Out</p>
                                <p className="text-xl font-bold text-green-900">₹45,200</p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <EarningsChart data={chartData} />
                        </div>

                        {/* Summary Widget */}
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-card p-6 text-white flex flex-col justify-between shadow-xl">
                            <div>
                                <h3 className="text-neutral-400 text-sm font-medium mb-1">Available for Payout</h3>
                                <div className="text-3xl font-bold">₹{stats.currentBalance.toLocaleString()}</div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-neutral-300">Next Payout</span>
                                        <span className="font-bold">Every Friday</span>
                                    </div>
                                    <div className="w-full bg-neutral-700 h-1.5 rounded-full mt-2">
                                        <div className="bg-brand-green h-full rounded-full" style={{ width: '70%' }} />
                                    </div>
                                </div>
                                <button className="w-full bg-brand-green text-black font-bold py-3 rounded-xl hover:bg-opacity-90 transition-colors">
                                    Withdraw Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transactions */}
                    <TransactionList transactions={transactions} />
                </div>
            )}
        </ProviderLayout>
    );
}
