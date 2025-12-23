'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureSentryException } from '../lib/sentry';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Route-specific Error Boundary
 * 
 * Provides more granular error handling for specific routes or sections.
 * Allows customization of error messages per route.
 */
export class RouteErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        captureSentryException(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'RouteErrorBoundary',
            route: window.location.pathname,
        });

        console.error('RouteErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });

        // Optionally reload the page
        window.location.reload();
    };

    handleGoBack = () => {
        window.history.back();
    };

    render() {
        if (this.state.hasError) {
            const title = this.props.fallbackTitle || 'Unable to load this page';
            const message = this.props.fallbackMessage || 'We encountered an error while loading this content.';

            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 text-center border border-slate-200 dark:border-slate-700">
                        <div className="mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg
                                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {message}
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded text-left">
                                <p className="text-xs font-mono text-orange-800 dark:text-orange-300 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={this.handleGoBack}
                                className="flex-1 py-2 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                aria-label="Go back"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                aria-label="Try again"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
