'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '@thelocals/core/services/adminService';
import { Dispute } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    MessageSquare,
    FileText
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../../components/auth/RoleGuard';

import { useDisputes } from '../../hooks/useAdminData';

export default function DisputesPage() {
    const { adminUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'OPEN' | 'RESOLVED' | 'DISMISSED'>('OPEN');
    const { disputes, isLoading: loading, mutate } = useDisputes(activeTab);

    // Resolution State
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolutionType, setResolutionType] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');

    // Removed manual loadDisputes/useEffect

    const handleActionClick = (dispute: Dispute, type: 'RESOLVED' | 'DISMISSED') => {
        setSelectedDispute(dispute);
        setResolutionType(type);
        setIsResolveModalOpen(true);
    };

    const submitResolution = async () => {
        if (!selectedDispute || !adminUser) return;

        try {
            await adminService.resolveDispute(selectedDispute.id, {
                status: resolutionType,
                notes: resolutionNotes,
                adminId: adminUser.id
            });
            toast.success(`Dispute ${resolutionType.toLowerCase()}`);
            setIsResolveModalOpen(false);
            setResolutionNotes('');
            setSelectedDispute(null);
            mutate();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <AdminLayout>
            <RoleGuard
                allowedRoles={['SUPER_ADMIN', 'SUPPORT_ADMIN', 'OPS_ADMIN']}
                fallback={<div className="p-8 text-center text-red-500">You do not have permission to access Disputes.</div>}
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Dispute Resolution</h1>
                        <p className="text-sm text-neutral-500">Handle support tickets and booking disputes.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex border-b border-neutral-200">
                        {(['OPEN', 'RESOLVED', 'DISMISSED'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                {tab} <span className="text-xs ml-1 bg-neutral-100 px-1.5 py-0.5 rounded-full">{activeTab === tab ? disputes.length : ''}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Card className="overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Ticket ID</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Reason</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Reporter</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Booking Ref</th>
                                <th className="text-left py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Received</th>
                                <th className="text-right py-3 px-6 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-neutral-500">Loading disputes...</td></tr>
                            ) : disputes.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No {activeTab.toLowerCase()} disputes found.</td></tr>
                            ) : (
                                disputes.map((d) => (
                                    <tr key={d.id} className="hover:bg-neutral-50/50">
                                        <td className="py-4 px-6 font-mono text-xs text-neutral-500">
                                            {d.id.slice(0, 8)}...
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="error" className="mb-1">{d.reason}</Badge>
                                            <p className="text-sm text-neutral-600 line-clamp-1">{d.description || 'No description'}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-neutral-900">
                                            {d.reporter?.full_name || 'Unknown'}
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs text-blue-600">
                                            {d.booking_id.slice(0, 8)}...
                                        </td>
                                        <td className="py-4 px-6 text-sm text-neutral-500">
                                            {new Date(d.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {d.status === 'OPEN' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleActionClick(d, 'RESOLVED')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Resolve">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button onClick={() => handleActionClick(d, 'DISMISSED')} className="p-2 bg-neutral-50 text-neutral-400 rounded hover:bg-neutral-100 hover:text-neutral-600" title="Dismiss">
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-neutral-400">Archived</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Resolution Modal */}
                {isResolveModalOpen && selectedDispute && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4 capitalize">
                                {resolutionType === 'RESOLVED' ? 'Resolve Dispute' : 'Dismiss Dispute'}
                            </h3>

                            <p className="text-sm text-neutral-500 mb-4">
                                Ticket for Booking <span className="font-mono text-neutral-700">{selectedDispute.booking_id.slice(0, 8)}</span><br />
                                Reported by {selectedDispute.reporter?.full_name}
                            </p>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-neutral-700">Resolution Notes</label>
                                <textarea
                                    className="w-full p-2 border border-neutral-300 rounded-lg h-32"
                                    placeholder={`Explain why this dispute is being ${resolutionType.toLowerCase()}...`}
                                    value={resolutionNotes}
                                    onChange={e => setResolutionNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setIsResolveModalOpen(false)} className="flex-1 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg font-medium">Cancel</button>
                                <button onClick={submitResolution} className={`flex-1 py-2 text-white rounded-lg font-medium capitalize ${resolutionType === 'RESOLVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-neutral-600 hover:bg-neutral-700'}`}>
                                    Confirm {resolutionType}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </RoleGuard>
        </AdminLayout >
    );
}
