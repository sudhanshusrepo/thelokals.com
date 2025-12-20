'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// export const runtime = 'edge';

export default function VerificationPendingPage() {
    const router = useRouter();
    const { profile, signOut } = useAuth();

    if (!profile) return null; // Or loader

    const isRejected = profile.verification_status === 'rejected';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 ${isRejected ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500 animate-pulse'}`}>
                    {isRejected ? '❌' : '⏳'}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {isRejected ? 'Verification Failed' : 'Under Review'}
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    {isRejected
                        ? "Unfortunately, we could not verify your documents. Please contact support for more details."
                        : "Thanks for signing up! our team is currently verifying your documents (Aadhaar/PAN). This usually takes 24-48 hours."
                    }
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left text-sm border border-slate-100">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-bold uppercase ${isRejected ? 'text-red-600' : 'text-amber-600'}`}>
                            {profile.verification_status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Submitted On</span>
                        <span className="font-medium text-slate-900">
                            {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        window.location.href = '/contact-support'; // Mock Support Page
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold mb-4 hover:bg-slate-50 transition-colors"
                >
                    Contact Support
                </button>

                <button
                    onClick={() => {
                        signOut();
                        router.push('/');
                    }}
                    className="text-slate-400 text-sm hover:text-slate-600"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
