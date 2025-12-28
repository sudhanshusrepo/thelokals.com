'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureSentryException } from '../lib/sentry';
import { ErrorFallback } from '@thelocals/core';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors to Sentry, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
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
        // Log error to Sentry
        captureSentryException(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'GlobalErrorBoundary',
        });

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            // Default fallback UI using Core component
            // Wrapper to adapt Core props if needed or direct usage
            // Core's ErrorFallback takes { error, resetErrorBoundary }
            return (
                <ErrorFallback
                    error={this.state.error || new Error('Unknown error')}
                    resetErrorBoundary={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}
