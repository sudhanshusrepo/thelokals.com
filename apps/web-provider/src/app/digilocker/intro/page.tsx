
'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { ProviderLayout } from '../../../components/layout/ProviderLayout';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function DigilockerIntroPage() {
    return (
        <ProviderLayout>
            <div className="max-w-2xl mx-auto py-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-yellow to-brand-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-green/20">
                    <Lock size={40} className="text-neutral-900" />
                </div>

                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                    Verify with DigiLocker
                </h1>
                <p className="text-lg text-neutral-600 mb-12 max-w-lg mx-auto">
                    Get your <span className="font-bold text-brand-green">Government Verified Badge</span> in 1 minute. Verified providers get 3x more bookings.
                </p>

                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm text-left mb-8 max-w-md mx-auto">
                    <h3 className="font-bold text-neutral-900 mb-4">Why verify?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="text-brand-green flex-shrink-0" />
                            <span className="text-neutral-600">Higher trust from customers</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="text-brand-green flex-shrink-0" />
                            <span className="text-neutral-600">Priority support & job matching</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="text-brand-green flex-shrink-0" />
                            <span className="text-neutral-600">Required for payments &gt; ₹10,000</span>
                        </li>
                    </ul>
                </div>

                <Link
                    href="/digilocker/auth"
                    className="inline-flex items-center gap-2 bg-neutral-900 text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                    <ShieldCheck size={24} />
                    Continue with DigiLocker
                </Link>

                <p className="text-xs text-neutral-400 mt-6">
                    Secure • Encrypted • Government Approved
                </p>
            </div>
        </ProviderLayout>
    );
}
