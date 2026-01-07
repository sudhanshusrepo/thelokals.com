'use client';

import React from 'react';
import { designTokensV2 } from '../theme/design-tokens-v2';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="text-center p-8 max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                        ⚠️
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
                    <p className="text-gray-500 mb-8">
                        We apologize for the inconvenience. Our team has been notified.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{ background: designTokensV2.colors.gradient.css }}
                        className="px-8 py-3 rounded-v2-btn font-bold text-v2-text-primary shadow-lg hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-60 text-xs text-red-600 font-mono">
                            {error.message}
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
