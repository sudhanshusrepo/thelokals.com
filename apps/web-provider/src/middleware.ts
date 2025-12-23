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

export function middleware(request: NextRequest) {
    // Apply rate limiting to sensitive endpoints
    if (
        request.nextUrl.pathname.startsWith('/api/provider/onboarding') ||
        request.nextUrl.pathname.startsWith('/api/upload')
    ) {
        const rateLimitResponse = rateLimit(request);
        if (rateLimitResponse) return rateLimitResponse;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
