'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@thelocals/core/services/supabase';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface Provider {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    category: string;
    experience_years: number;
    verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
    submitted_at: string;
    created_at: string;
}

export const ProviderApprovalQueue: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

    useEffect(() => {
        fetchProviders();
    }, [filter]);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('providers')
                .select('*')
                .order('submitted_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('verification_status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProviders(data || []);
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (providerId: string) => {
        try {
            const { error } = await supabase
                .from('providers')
                .update({
                    verification_status: 'approved',
                    verified_at: new Date().toISOString(),
                    verified_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', providerId);

            if (error) throw error;

            // Log approval history
            await supabase.from('provider_approval_history').insert({
                provider_id: providerId,
                action: 'approved',
                performed_by: (await supabase.auth.getUser()).data.user?.id
            });

            fetchProviders();
            setSelectedProvider(null);
        } catch (error) {
            console.error('Failed to approve provider:', error);
        }
    };

    const handleReject = async (providerId: string, reason: string) => {
        try {
            const { error } = await supabase
                .from('providers')
                .update({
                    verification_status: 'rejected',
                    rejection_reason: reason,
                    verified_at: new Date().toISOString(),
                    verified_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', providerId);

            if (error) throw error;

            // Log rejection history
            await supabase.from('provider_approval_history').insert({
                provider_id: providerId,
                action: 'rejected',
                performed_by: (await supabase.auth.getUser()).data.user?.id,
                reason
            });

            fetchProviders();
            setSelectedProvider(null);
        } catch (error) {
            console.error('Failed to reject provider:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#0A2540] mb-2">Provider Approval Queue</h1>
                <p className="text-[#64748B]">Review and approve provider applications</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status
                                ? 'bg-[#0A2540] text-white'
                                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#12B3A6]'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Provider List */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : providers.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-[#64748B]">No providers found</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providers.map((provider) => (
                        <Card key={provider.id} hover>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-[#0A2540]">{provider.full_name}</h3>
                                    <p className="text-sm text-[#64748B]">{provider.category}</p>
                                </div>
                                <Badge
                                    variant={
                                        provider.verification_status === 'approved'
                                            ? 'approved'
                                            : provider.verification_status === 'rejected'
                                                ? 'rejected'
                                                : 'pending'
                                    }
                                >
                                    {provider.verification_status}
                                </Badge>
                            </div>

                            <div className="space-y-1 text-sm mb-4">
                                <p className="text-[#64748B]">📧 {provider.email}</p>
                                <p className="text-[#64748B]">📱 {provider.phone}</p>
                                <p className="text-[#64748B]">💼 {provider.experience_years} years exp</p>
                            </div>

                            {provider.verification_status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleApprove(provider.id)}
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const reason = prompt('Rejection reason:');
                                            if (reason) handleReject(provider.id, reason);
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
