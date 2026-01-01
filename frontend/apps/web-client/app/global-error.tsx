'use client';

import { useEffect } from 'react';
import { captureSentryException } from '../lib/sentry';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        captureSentryException(error, {
            digest: error.digest,
            errorPage: 'app/global-error.tsx',
            critical: true,
        });
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                    <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-2xl p-8 text-center">
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-red-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Critical Error
                            </h1>
                            <p className="text-slate-400">
                                We're experiencing technical difficulties. Our team has been notified.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={reset}
                                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                                aria-label="Try again"
                            >
                                Try Again
                            </button>
                            <a
                                href="/"
                                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                            >
                                Reload Application
                            </a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
