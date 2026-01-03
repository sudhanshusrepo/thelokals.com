'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { CheckCircle2, XCircle, Clock, Search, ShieldCheck } from 'lucide-react';
import { adminService } from '@thelocals/core/services/adminService';
import { WorkerProfile } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function Partners() {
    const { adminUser } = useAuth();
    const [providers, setProviders] = useState<WorkerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        loadProviders();
    }, [filter]);

    const loadProviders = async () => {
        setLoading(true);
        try {
            const status = filter === 'all' ? undefined : filter;
            const data = await adminService.getAllProviders(status);
            setProviders(data);
        } catch (error) {
            toast.error("Failed to load providers");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string, action: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${action} this provider?`)) return;

        try {
            if (!adminUser?.id) return;

            await adminService.verifyProvider(
                id,
                action,
                adminUser.id,
                action === 'rejected' ? 'Admin rejection' : undefined
            );

            toast.success(`Provider ${action} successfully`);
            loadProviders();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getStatusBadge = (provider: WorkerProfile) => {
        if (provider.verification_status === 'pending') {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} /> Pending</span>;
        } else if (provider.is_verified) {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 size={12} /> Verified</span>;
        } else if (provider.verification_status === 'rejected') {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> Rejected</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Partners</h1>
                    <p className="text-sm text-neutral-500">Onboard and manage service providers.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-neutral-200">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${filter === f
                                    ? 'bg-neutral-100 text-neutral-900 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Provider</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">Loading partners...</td>
                                </tr>
                            ) : providers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">No {filter !== 'all' ? filter : ''} partners found.</td>
                                </tr>
                            ) : (
                                providers.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                                                    {/* Avatar placeholder */}
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-500">
                                                        {provider.full_name?.charAt(0) || 'P'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{provider.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-neutral-500">ID: {provider.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">
                                                <p className="text-neutral-900">{provider.phone || '-'}</p>
                                                <p className="text-neutral-500 text-xs">Ph. No</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(provider)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-neutral-500">
                                            {new Date(provider.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-end gap-2">
                                                {provider.verification_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerify(provider.id, 'approved')}
                                                            title="Approve"
                                                            className="p-1 px-2 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium transition-colors border border-green-200"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(provider.id, 'rejected')}
                                                            title="Reject"
                                                            className="p-1 px-2 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium transition-colors border border-red-200"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors">
                                                    View
                                                </button>
                                            </div>
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
