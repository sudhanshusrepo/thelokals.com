'use client';

import React from 'react';
import { Wallet, CreditCard, History, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WalletPage() {
    const transactions = [
        { id: 1, title: 'Deep Cleaning Service', date: '2 days ago', amount: '-₹899', type: 'debit' },
        { id: 2, title: 'Wallet Top-up', date: '5 days ago', amount: '+₹2000', type: 'credit' }
    ];

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
            <h1 className="text-2xl font-bold text-v2-text-primary mb-6">Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-v2-primary to-v2-primary-dark rounded-v2-card p-6 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Wallet size={20} />
                        <span className="font-medium">Lokals Balance</span>
                    </div>
                    <div className="text-4xl font-bold mb-6">₹1,101.00</div>

                    <button
                        onClick={() => toast('Top-up feature coming soon!')}
                        className="bg-white text-v2-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={16} />
                        Add Money
                    </button>
                </div>
            </div>

            {/* Transactions */}
            <h3 className="text-lg font-bold text-v2-text-primary mb-4">Recent Transactions</h3>
            <div className="space-y-4">
                {transactions.map(tx => (
                    <div key={tx.id} className="bg-white p-4 rounded-v2-card border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {tx.type === 'credit' ? <CreditCard size={20} /> : <History size={20} />}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{tx.title}</div>
                                <div className="text-xs text-gray-500">{tx.date}</div>
                            </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                            {tx.amount}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
