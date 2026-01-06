
'use client';

import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface Transaction {
    id: string;
    created_at: string;
    service_category: string;
    provider_earnings: number;
    status: string;
    payment_status: string;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
    return (
        <div className="bg-white rounded-card shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">Recent Transactions</h3>
                <button className="text-sm text-neutral-400 hover:text-neutral-900">View All</button>
            </div>

            {transactions.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                    No transactions yet.
                </div>
            ) : (
                <div className="divide-y divide-neutral-100">
                    {transactions.map((t) => (
                        <div key={t.id} className="p-4 hover:bg-neutral-50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.payment_status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {t.payment_status === 'PAID' ? <ArrowDownLeft size={20} /> : <Clock size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-900 text-sm">{t.service_category || 'Service Payment'}</p>
                                    <p className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-neutral-900">+₹{t.provider_earnings}</p>
                                <p className={`text-[10px] font-bold uppercase ${t.payment_status === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
                                    {t.payment_status || 'PENDING'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
