'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@thelocals/core/services/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

export default function VerificationPendingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [status, setStatus] = useState<VerificationStatus>('pending');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        fetchVerificationStatus();
        subscribeToStatusChanges();
    }, [user]);

    const fetchVerificationStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('providers')
                .select('verification_status, rejection_reason')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setStatus(data.verification_status as VerificationStatus);
                setRejectionReason(data.rejection_reason || '');

                // If approved, redirect to dashboard
                if (data.verification_status === 'approved') {
                    setTimeout(() => router.push('/dashboard'), 3000);
                }
            }
        } catch (error) {
            console.error('Failed to fetch verification status:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToStatusChanges = () => {
        const channel = supabase
            .channel(`provider-status-${user?.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'providers',
                    filter: `id=eq.${user?.id}`
                },
                (payload: any) => {
                    const newStatus = payload.new.verification_status as VerificationStatus;
                    setStatus(newStatus);
                    setRejectionReason(payload.new.rejection_reason || '');

                    // Show celebration and redirect on approval
                    if (newStatus === 'approved') {
                        setTimeout(() => router.push('/dashboard'), 3000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F7FB] to-white">
                <div className="text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <p className="text-[#64748B]">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F7FB] to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {status === 'pending' && (
                    <Card>
                        <div className="text-center">
                            <div className="text-6xl mb-6 animate-pulse">⏰</div>
                            <h1 className="text-3xl font-bold text-[#0A2540] mb-4">
                                Application Under Review
                            </h1>
                            <p className="text-lg text-[#64748B] mb-8">
                                Thank you for submitting your application! Our team is reviewing your documents.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-blue-900 mb-3">What's happening now?</h3>
                                <div className="space-y-3 text-left">
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-600 text-xl">✓</span>
                                        <div>
                                            <p className="font-medium text-blue-900">Application Received</p>
                                            <p className="text-sm text-blue-700">We've received all your documents</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-600 text-xl animate-spin">⚙️</span>
                                        <div>
                                            <p className="font-medium text-blue-900">Under Review</p>
                                            <p className="text-sm text-blue-700">Our team is verifying your information</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[#64748B] text-xl">⏳</span>
                                        <div>
                                            <p className="font-medium text-[#64748B]">Approval Pending</p>
                                            <p className="text-sm text-[#64748B]">Usually takes 24-48 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-[#64748B]">
                                <p>You'll receive an email and SMS notification once approved.</p>
                                <p className="mt-2">
                                    Questions? Contact us at{' '}
                                    <a href="mailto:support@lokals.com" className="text-[#12B3A6] hover:underline">
                                        support@lokals.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {status === 'approved' && (
                    <Card>
                        <div className="text-center">
                            <div className="text-6xl mb-6">🎉</div>
                            <h1 className="text-3xl font-bold text-[#0A2540] mb-4">
                                Congratulations! You're Approved!
                            </h1>
                            <p className="text-lg text-[#64748B] mb-8">
                                Welcome to the lokals family! You can now start accepting bookings.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-green-900 mb-3">What's next?</h3>
                                <ul className="space-y-2 text-left text-green-800">
                                    <li className="flex items-center gap-2">
                                        <span>✓</span>
                                        <span>Set your availability and service area</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✓</span>
                                        <span>Start receiving booking requests</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✓</span>
                                        <span>Build your reputation with great service</span>
                                    </li>
                                </ul>
                            </div>

                            <p className="text-sm text-[#64748B] mb-6">
                                Redirecting to dashboard in 3 seconds...
                            </p>

                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-8 py-3 bg-[#12B3A6] text-white font-bold rounded-xl hover:bg-[#0e9085] transition-all shadow-lg"
                            >
                                Go to Dashboard →
                            </button>
                        </div>
                    </Card>
                )}

                {status === 'rejected' && (
                    <Card>
                        <div className="text-center">
                            <div className="text-6xl mb-6">😔</div>
                            <h1 className="text-3xl font-bold text-[#0A2540] mb-4">
                                Application Not Approved
                            </h1>
                            <p className="text-lg text-[#64748B] mb-8">
                                Unfortunately, we couldn't approve your application at this time.
                            </p>

                            {rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
                                    <h3 className="font-semibold text-red-900 mb-2">Reason:</h3>
                                    <p className="text-red-800">{rejectionReason}</p>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                                <h3 className="font-semibold text-blue-900 mb-3">What you can do:</h3>
                                <ul className="space-y-2 text-left text-blue-800">
                                    <li className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>Review the reason above and address any issues</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>Update your documents or information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>Resubmit your application</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push('/onboarding')}
                                    className="flex-1 px-6 py-3 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-[#06192E] transition-all"
                                >
                                    Resubmit Application
                                </button>
                                <button
                                    onClick={() => window.location.href = 'mailto:support@lokals.com'}
                                    className="flex-1 px-6 py-3 border-2 border-[#0A2540] text-[#0A2540] font-bold rounded-xl hover:bg-[#F5F7FB] transition-all"
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
