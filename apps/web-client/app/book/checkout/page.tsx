'use client';

import React, { Suspense } from 'react';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import CheckoutContent from './CheckoutContent';

import { ErrorBoundary } from '../../../components/ErrorBoundary';

export default function CheckoutPage() {
    return (
        <AuthGuard>
            <ErrorBoundary fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Checkout Error</h2>
                        <p className="text-slate-600 mb-4">We encountered an issue loading the checkout. Please try refreshing.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            }>
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-slate-50">
                        <p className="text-slate-500">Loading checkout...</p>
                    </div>
                }>
                    <CheckoutContent />
                </Suspense>
            </ErrorBoundary>
        </AuthGuard>
    );
}
