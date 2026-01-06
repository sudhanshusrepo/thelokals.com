'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-hot-toast';
import { UserIdentity } from '@supabase/supabase-js';

export default function LinkedAccounts() {
    const [identities, setIdentities] = useState<UserIdentity[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchIdentities();
    }, []);

    const fetchIdentities = async () => {
        try {
            const { data } = await supabase.auth.getUserIdentities();
            if (data?.identities) {
                setIdentities(data.identities);
            }
        } catch (error) {
            console.error('Error fetching identities:', error);
        } finally {
            setLoading(false);
        }
    };

    const linkGoogle = async () => {
        setLinkingProvider('google');
        try {
            const { data, error } = await supabase.auth.linkIdentity({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard/profile`,
                },
            });
            if (error) throw error;
            // Redirect happens automatically
        } catch (error: any) {
            toast.error(error.message || 'Failed to link Google account');
            setLinkingProvider(null);
        }
    };

    const unlinkIdentity = async (identity: UserIdentity) => {
        if (!confirm(`Are you sure you want to unlink your ${identity.provider} account?`)) return;

        try {
            const { error } = await supabase.auth.unlinkIdentity(identity);
            if (error) throw error;

            toast.success('Account unlinked successfully');
            fetchIdentities(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || 'Failed to unlink account');
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google':
                return (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            className="text-blue-500"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            className="text-green-500"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            className="text-yellow-500"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            className="text-red-500"
                        />
                    </svg>
                );
            case 'email':
                return <Mail size={20} className="text-gray-600" />;
            default:
                return <Mail size={20} className="text-gray-600" />;
        }
    };

    const googleIdentity = identities.find(id => id.provider === 'google');
    const emailIdentity = identities.find(id => id.provider === 'email');

    if (loading) {
        return <div className="animate-pulse h-24 bg-gray-100 rounded-v2-card"></div>;
    }

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-v2-text-primary mb-4">Linked Accounts</h3>
            <div className="bg-white rounded-v2-card border border-gray-100 divide-y divide-gray-100">

                {/* Email Identity (Usually strictly read-only for now) */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                            {getProviderIcon('email')}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Email</div>
                            <div className="text-sm text-gray-500">{emailIdentity?.identity_data?.email || 'Not connected'}</div>
                        </div>
                    </div>
                    {emailIdentity && (
                        <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Check size={12} />
                            Connected
                        </div>
                    )}
                </div>

                {/* Google Identity */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                            {getProviderIcon('google')}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Google</div>
                            <div className="text-sm text-gray-500">
                                {googleIdentity ? (googleIdentity.identity_data?.email || 'Connected') : 'Link your Google account'}
                            </div>
                        </div>
                    </div>

                    {googleIdentity ? (
                        <button
                            onClick={() => unlinkIdentity(googleIdentity)}
                            className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <span className="hidden group-hover:inline">Unlink</span>
                            <span className="group-hover:hidden text-green-600 flex items-center gap-1">
                                <Check size={14} /> Connected
                            </span>
                            <X size={16} className="hidden group-hover:block" />
                        </button>
                    ) : (
                        <button
                            onClick={linkGoogle}
                            disabled={!!linkingProvider}
                            className="px-4 py-2 text-sm font-medium text-white bg-v2-primary hover:bg-v2-primary-dark rounded-v2-button transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {linkingProvider === 'google' && <Loader2 size={14} className="animate-spin" />}
                            Connect
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
