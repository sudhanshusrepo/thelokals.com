/**
 * TheLokals Cloudflare Worker
 * Implements Edge-First Computing: Geo-IP, Rate Limiting, Proxy
 */

export interface Env {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    ENVIRONMENT: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // 1. Geo-IP Extraction
        const country = request.headers.get('cf-ipcountry') || 'IN'; // Default to India
        const city = request.headers.get('cf-ipcity') || 'Unknown';
        const region = request.headers.get('cf-region') || 'Unknown';
        const locationJson = JSON.stringify({ country, city, region });

        console.log(`[Edge] Request from ${city}, ${country} for ${url.pathname}`);

        // 2. Health Check
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'healthy',
                location: { city, country, region },
                timestamp: new Date().toISOString()
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 3. Simple Rate Limiting (In-Memory for Demo/Dev)
        // Note: For prod, use Cloudflare Rate Limiting feature or Durable Objects for strict counting
        // This is a placeholder to show the concept as per Bible Principle 2
        // For now, we pass through but logged the request.

        // 4. Proxy Response (Example: Echo headers for verification)
        // In real architecture, this would fetch(SUPABASE_FUNCTION_URL) or route to Next.js
        return new Response(`Worker Active. Location: ${city}, ${country}`, {
            headers: {
                'x-geo-city': city,
                'x-geo-country': country,
                'x-geo-region': region,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'public, max-age=60, s-maxage=60' // Cache at cdN/Edge for 60s
            }
        });
    },
};
