/**
 * Sentry Configuration for Next.js
 * 
 * This file configures Sentry for error tracking and performance monitoring.
 * Set NEXT_PUBLIC_SENTRY_DSN in your environment variables to enable Sentry.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

export function initSentry() {
    if (!SENTRY_DSN) {
        console.warn('Sentry DSN not configured. Error tracking is disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENVIRONMENT,

        // Performance Monitoring
        tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Error filtering
        beforeSend(event, hint) {
            // Filter out errors in development
            if (SENTRY_ENVIRONMENT === 'development') {
                console.error('Sentry Event:', event, hint);
                return null; // Don't send to Sentry in dev
            }

            // Filter out known non-critical errors
            const error = hint.originalException;
            if (error && typeof error === 'object' && 'message' in error) {
                const message = String(error.message);

                // Ignore ResizeObserver errors (browser quirk)
                if (message.includes('ResizeObserver')) {
                    return null;
                }

                // Ignore network errors that are expected
                if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
                    return null;
                }
            }

            return event;
        },
    });
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string; phone?: string } | null) {
    if (!SENTRY_DSN) return;

    if (user) {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            phone: user.phone,
        });
    } else {
        Sentry.setUser(null);
    }
}

/**
 * Add breadcrumb for debugging
 */
export function addSentryBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info', data?: Record<string, any>) {
    if (!SENTRY_DSN) return;

    Sentry.addBreadcrumb({
        message,
        category,
        level,
        data,
        timestamp: Date.now() / 1000,
    });
}

/**
 * Capture exception manually
 */
export function captureSentryException(error: Error, context?: Record<string, any>) {
    if (!SENTRY_DSN) {
        console.error('Sentry Exception:', error, context);
        return;
    }

    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Capture message manually
 */
export function captureSentryMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    if (!SENTRY_DSN) {
        console.log(`Sentry Message [${level}]:`, message, context);
        return;
    }

    Sentry.captureMessage(message, {
        level,
        extra: context,
    });
}

export { Sentry };
