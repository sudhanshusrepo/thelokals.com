'use client';
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to error reporting service (e.g., Sentry)
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to Sentry
        // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F7FB] to-white p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-[#0A2540] mb-4">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-[#64748B] mb-6">
                            We're sorry for the inconvenience. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-[#06192E] transition-all"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
