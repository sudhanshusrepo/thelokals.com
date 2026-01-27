
// packages/worker/functions/geo-availability/index.js

import { createSupabaseClient } from './supabase-client.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { service: service_code, pincode } = Object.fromEntries(url.searchParams);

        // 1. Validate Input
        if (!service_code || !pincode) {
            return new Response('Missing service or pincode parameters', { status: 400 });
        }

        // 2. Check KV Cache
        const cacheKey = `availability:${service_code}:${pincode}`;
        let cached = null;

        try {
            cached = await env.KV.get(cacheKey, { type: 'json' });
        } catch (e) {
            console.error("KV Error:", e);
        }

        if (cached) {
            return Response.json({ ...cached, cache_hit: true });
        }

        // 3. Initialize Supabase Client
        const supabase = createSupabaseClient(env);

        // 4. Call RPC
        const { data, error } = await supabase.rpc('resolve_service_availability', {
            p_service_code: service_code,
            p_pincode: pincode
        });

        if (error) {
            console.error("Supabase RPC Error:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. Format Response
        const result = data && data.length > 0 ? data[0] : null;

        // Default fallback if RPC returns nothing (should not happen with current logic, but safe guard)
        const response = {
            service_code,
            pincode,
            is_enabled: result ? result.is_enabled : true,
            resolved_scope: result ? result.resolved_scope : 'GLOBAL',
            scope_name: result ? result.scope_name : 'Global Default',
            resolved_at: new Date().toISOString(),
            cache_hit: false
        };

        // 6. Update KV Cache (TTL 10 mins)
        // Use ctx.waitUntil to not block response
        ctx.waitUntil(
            env.KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 600 })
        );

        return Response.json(response);
    }
};
