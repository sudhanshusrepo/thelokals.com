# Environment Variable Strategy (Production)

To ensure robust deployments on Cloudflare Pages and prevent "Runtime Mismatch" or "Missing Env" errors, theLokals monorepo uses a **Baked-in Strategy** for public keys.

## Public Variables
Variables prefixed with `NEXT_PUBLIC_` or `VITE_` are safe to expose to the browser.
To guarantee they are present during the build (which happens in an isolated container), we explicitly commit `.env.production` files to each application.

**Locations:**
- `apps/web-client/.env.production`
- `apps/web-provider/.env.production`
- `apps/web-admin/.env.production`

**Content:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://gdnltvvxiychrsdzenia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

> **Note:** These files are forced into git via `git add -f` despite `.gitignore` rules usually blocking `.env` files. This is intentional for **Public keys only**.

## Secret Variables
Secrets (like `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY`) must **NEVER** be committed.
These are managed via:
1. **Cloudflare Dashboard:** Settings -> Environment Variables.
2. **Supabase Dashboard:** Edge Function Secrets.

## Troubleshooting
If an app loads but fails to connect to Supabase:
1. Check if `.env.production` exists in the app's root.
2. Verify the keys in `.env.production` match the Supabase project configuration.
3. Redeploy the application.
