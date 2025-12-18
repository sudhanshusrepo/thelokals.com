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

        // 3. Routing Logic (Placeholder for full implementation)
        // For now, we return a simple welcome message to verify deployment
        return new Response(`Welcome to TheLokals Edge Network!\nLocation: ${city}, ${country}`, {
            headers: {
                'x-geo-city': city,
                'x-geo-country': country
            }
        });
    },
};
