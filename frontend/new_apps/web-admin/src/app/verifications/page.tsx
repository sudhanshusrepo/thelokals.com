'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '@thelocals/core/services/adminService';
import { WorkerProfile } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import { ShieldCheck, CheckCircle2, XCircle, Clock, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

import { useVerifications } from '../../hooks/useAdminData';

export default function VerificationsPage() {
    const { adminUser } = useAuth();
    const { pendingProviders, isLoading: loading, mutate } = useVerifications();

    // Rejection Modal State
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // Removed useEffect/loadQueue

    const handleApprove = async (id: string, name: string) => {
        if (!confirm(`Verify ${name}? This will make their profile public.`)) return;
        if (!adminUser?.id) return toast.error("Admin session error");

        setProcessing(true);
        try {
            await adminService.verifyProvider(id, 'approved', adminUser.id);
            toast.success(`${name} verified successfully`);
            mutate();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectingId || !rejectionReason || !adminUser?.id) return;

        setProcessing(true);
        try {
            await adminService.verifyProvider(rejectingId, 'rejected', adminUser.id, rejectionReason);
            toast.error("Provider rejected");
            setRejectingId(null);
            setRejectionReason('');
            mutate();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Verification Queue</h1>
                    <p className="text-sm text-neutral-500">Review and approve new provider applications.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                        {pendingProviders.length}
                    </span>
                    <span className="text-sm font-medium text-neutral-600">Pending Review</span>
                </div>
            </div>

            {loading ? (
                <Card className="p-12 flex flex-col items-center justify-center text-neutral-500 gap-3">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    <p>Loading queue...</p>
                </Card>
            ) : pendingProviders.length === 0 ? (
                <Card className="p-12 flex flex-col items-center justify-center text-neutral-500 gap-3">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle2 size={24} />
                    </div>
                    <h3 className="font-medium text-neutral-900">All caught up!</h3>
                    <p className="text-sm">No pending provider applications.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pendingProviders.map((provider) => (
                        <Card key={provider.id} className="p-0 overflow-hidden border-l-4 border-l-yellow-400">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Provider Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start gap-4">
                                            {provider.imageUrl ? (
                                                <img src={provider.imageUrl} alt={provider.name} className="w-16 h-16 rounded-lg object-cover bg-neutral-100" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold text-xl">
                                                    {provider.name?.[0] || '?'}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                                    {provider.name}
                                                    <Badge variant="warning">Pending</Badge>
                                                </h3>
                                                <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                                                    <span className="capitalize">{provider.category}</span>
                                                    <span>•</span>
                                                    <span>{provider.location?.lat}, {provider.location?.lng}</span>
                                                </p>
                                                <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                                                    {provider.description || "No description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold mb-1">Pricing</p>
                                                <p className="font-medium">₹{provider.price} / {provider.priceUnit}</p>
                                            </div>
                                            <div>
                                                <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold mb-1">Created</p>
                                                <p className="font-medium">{new Date(provider.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-neutral-500 text-xs uppercase tracking-wider font-semibold mb-1">Experience</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {provider.expertise?.map(e => (
                                                        <span key={e} className="bg-white border px-1.5 py-0.5 rounded text-xs text-neutral-600">{e}</span>
                                                    )) || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Center */}
                                    <div className="flex flex-col gap-3 min-w-[200px] border-l border-neutral-100 pl-6 border-dashed justify-center">
                                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Action Center</h4>
                                        <button
                                            onClick={() => handleApprove(provider.id, provider.name)}
                                            disabled={processing}
                                            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectingId(provider.id)}
                                            disabled={processing}
                                            className="flex items-center justify-center gap-2 w-full bg-white border border-red-200 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                        <button className="flex items-center justify-center gap-2 w-full text-neutral-500 hover:text-neutral-900 py-2 text-sm transition-colors">
                                            <ExternalLink size={14} /> View Full Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Rejection Modal */}
            {rejectingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-neutral-900 mb-2">Reject Application</h3>
                        <p className="text-sm text-neutral-500 text-center mb-6">
                            Please provide a reason for rejecting this provider. This will be shared with them.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., ID document is blurry, Invalid certification..."
                            className="w-full h-24 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none text-sm mb-4 resize-none"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                className="flex-1 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason || processing}
                                className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
