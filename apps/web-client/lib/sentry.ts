/**
 * Sentry Configuration for Next.js
 * 
 * DISABLED for Cloudflare Pages deployment
 * Sentry is not compatible with Cloudflare Workers runtime
 */

// No-op functions for Cloudflare compatibility
export function initSentry() {
    // Sentry disabled for Cloudflare Pages
    if (typeof window !== 'undefined') {
        console.log('[Sentry] Disabled for Cloudflare Pages deployment');
    }
}

export function setSentryUser(_user: { id: string; email?: string; phone?: string } | null) {
    // No-op
}

export function addSentryBreadcrumb(_message: string, _category: string, _level: any = 'info', _data?: Record<string, any>) {
    // No-op
}

export function captureSentryException(error: Error, context?: Record<string, any>) {
    if (typeof window !== 'undefined') {
        console.error('Error:', error, context);
    }
}

export function captureSentryMessage(message: string, level: any = 'info', context?: Record<string, any>) {
    if (typeof window !== 'undefined') {
        console.log(`[${level}]:`, message, context);
    }
}

// Export empty Sentry object
export const Sentry = {};
