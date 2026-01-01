'use client';

import { useEffect } from 'react';
import { captureSentryException } from '../lib/sentry';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to Sentry
        captureSentryException(error, {
            digest: error.digest,
            errorPage: 'app/error.tsx',
        });
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Something went wrong
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        We encountered an unexpected error. Please try again.
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-left">
                        <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs font-mono text-red-600 dark:text-red-400 mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        aria-label="Try again"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="w-full py-3 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors text-center focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                        Go to Homepage
                    </a>
                </div>
            </div>
        </div>
    );
}
