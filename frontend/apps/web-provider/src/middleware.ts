import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export function rateLimit(request: NextRequest): NextResponse | null {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();

    const rateLimitData = rateLimitStore.get(ip);

    if (!rateLimitData || now > rateLimitData.resetTime) {
        // New window
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return null;
    }

    if (rateLimitData.count >= MAX_REQUESTS) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitData.resetTime - now) / 1000)) } }
        );
    }

    rateLimitData.count++;
    return null;
}

export async function middleware(request: NextRequest) {
    // Apply rate limiting to sensitive endpoints
    if (
        request.nextUrl.pathname.startsWith('/api/provider/onboarding') ||
        request.nextUrl.pathname.startsWith('/api/upload')
    ) {
        const rateLimitResponse = rateLimit(request);
        if (rateLimitResponse) return rateLimitResponse;
    }

    // Basic Auth Guard for /dashboard and /onboarding (ensure session cookie exists)
    // Note: This is a shallow check. Deep profile check happens in Layout/Context.
    const hasSession = request.cookies.has('sb-access-token') || request.cookies.has('sb-refresh-token'); // Adjust cookie names based on Supabase config if needed, or just rely on client-side for now if we don't want to parse JWT here.

    // Actually, for a pure client-side app served via Next.js, we often rely on AuthContext. 
    // But prohibiting access to /dashboard without login is good.
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    // If implementing strict middleware auth:
    // import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
    // ... logic to check session ...

    // For now, keeping it simple as per previous pattern: simple return.
    // The main redirection logic for 'onboarded vs not' is best handled in a layout or route guard component 
    // because middleware doesn't have easy access to the 'providers' table to check 'verification_status'.

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
