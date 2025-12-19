import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { toast } from 'react-hot-toast';

export default function VerificationPage() {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingProviders();
    }, []);

    const fetchPendingProviders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .eq('verification_status', 'pending');

        if (error) {
            toast.error("Error fetching providers");
        } else {
            setProviders(data || []);
        }
        setLoading(false);
    };

    const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('providers')
                .update({ verification_status: status })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Provider ${status}`);
            fetchPendingProviders(); // Refresh list
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    if (loading) return <div className="p-8">Loading pending verifications...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Pending Verifications</h1>

            {providers.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No pending verifications. All caught up! ✅
                </div>
            ) : (
                <div className="grid gap-4">
                    {providers.map(provider => (
                        <div key={provider.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{provider.full_name}</h3>
                                <div className="text-sm text-gray-500 mb-1">
                                    {provider.business_name} • {provider.category}
                                </div>
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                    Submitted: {new Date(provider.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVerify(provider.id, 'rejected')}
                                    className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerify(provider.id, 'approved')}
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
