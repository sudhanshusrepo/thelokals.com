
# Cloudflare Worker Deployment Skill

## Context
This skill documents the process for deploying the `geo-availability` worker, which caches Supabase RPC responses to edge locations.

## Prerequisites
- Authenticated Wrangler: `npx wrangler login`
- Supabase Project credentials.

## Steps to Deploy

1.  **Create KV Namespace**
    *IMPORTANT*: Use **SPACE** separation, not colons, for this environment.
    ```bash
    npx wrangler kv namespace create "geo-availability-cache"
    ```
    *Output:*
    ```toml
    [[kv_namespaces]]
    binding = "KV"
    id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```
    *Action:* Copy the `id` to `wrangler.toml`.

2.  **Configure `wrangler.toml`**
    - Path: `packages/worker/functions/geo-availability/wrangler.toml`
    - Ensure `SUPABASE_URL` is set.
    - Update `id` in `[[kv_namespaces]]`.

3.  **Set Secrets**
    ```bash
    npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
    ```

4.  **Deploy**
    ```bash
    npx wrangler deploy
    ```

## Troubleshooting
- **Assertion Failed / Node Crashes**: Common in some Windows environments with `npx`. Retry or run from a standard terminal.
- **Unknown Arguments**: The CLI structure here uses spaces (`wrangler kv namespace`) instead of colons (`wrangler kv:namespace`).
