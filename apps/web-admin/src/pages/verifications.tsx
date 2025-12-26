import React, { useEffect, useState } from 'react';
import { adminService } from '@thelocals/core/services/adminService';
import { WorkerProfile } from '@thelocals/core/types';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function VerificationPage() {
    const { adminUser } = useAuth();
    const [providers, setProviders] = useState<WorkerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    // Rejection Modal State
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingProviders();
    }, []);

    const fetchPendingProviders = async () => {
        setLoading(true);
        try {
            // Add 5 second timeout to prevent infinite loading
            const providersPromise = adminService.getPendingProviders();
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 5000)
            );

            const data = await Promise.race([providersPromise, timeoutPromise]) as WorkerProfile[];
            setProviders(data);
        } catch (error) {
            console.error(error);
            toast.error("Error fetching providers");
            // Set empty array instead of staying in loading state
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!adminUser) return;
        if (!confirm("Are you sure you want to approve this provider?")) return;

        setProcessing(id);
        try {
            await adminService.verifyProvider(id, 'approved', adminUser.id);
            toast.success("Provider approved successfully");
            setProviders(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!adminUser || !rejectId) return;
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setProcessing(rejectId);
        try {
            await adminService.verifyProvider(rejectId, 'rejected', adminUser.id, rejectionReason);
            toast.success("Provider rejected");
            setProviders(prev => prev.filter(p => p.id !== rejectId));
            closeRejectModal();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setProcessing(null);
        }
    };

    const openRejectModal = (id: string) => {
        setRejectId(id);
        setRejectionReason('');
    };

    const closeRejectModal = () => {
        setRejectId(null);
        setRejectionReason('');
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pending Verifications</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and approve new provider applications</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="font-bold text-lg text-primary">{providers.length}</span>
                    <span className="text-gray-500 ml-2 text-sm">Pending</span>
                </div>
            </div>

            {providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-green-50 p-4 rounded-full mb-4">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">All Caught Up!</h3>
                    <p className="text-gray-500 mt-2">There are no pending provider verifications at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {providers.map(provider => (
                        <div key={provider.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {provider.imageUrl ? (
                                        <img src={provider.imageUrl} alt={provider.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-400">{provider.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-gray-900">{provider.name}</h3>
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {provider.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{provider.description || "No description provided"}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span>ID: {provider.id.slice(0, 8)}...</span>
                                        {/* Fallback for created_at if not present in type yet, assuming it might be added or using a workaround */}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => openRejectModal(provider.id)}
                                    disabled={!!processing}
                                    className="flex-1 md:flex-none px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(provider.id)}
                                    disabled={!!processing}
                                    className="flex-1 md:flex-none px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-primary-hover hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {processing === provider.id ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Approve <CheckCircle size={16} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection Modal */}
            {rejectId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <AlertCircle size={18} className="text-red-500" />
                                Reject Provider Application
                            </h3>
                            <button onClick={closeRejectModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for rejecting this application. This will be visible to the provider.
                            </p>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Rejection Reason</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-sm min-h-[100px]"
                                placeholder="E.g., Incomplete documentation, Profile photo unclear..."
                                autoFocus
                            />
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={closeRejectModal}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || !!processing}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
