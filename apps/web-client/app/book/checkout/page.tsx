'use client';

import React, { Suspense } from 'react';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import CheckoutContent from './CheckoutContent';

export default function CheckoutPage() {
    return (
        <AuthGuard>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <p className="text-slate-500">Loading checkout...</p>
                </div>
            }>
                <CheckoutContent />
            </Suspense>
        </AuthGuard>
    );
}
