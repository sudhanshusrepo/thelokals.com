# Cloudflare Pages Configuration

## The Problem
npm's workspace feature automatically runs scripts across ALL workspaces when you call `npm run <script>` from the root. This cannot be disabled or overridden when workspaces are defined in `package.json`.

## The Solution
Configure Cloudflare Pages to run the build script DIRECTLY, bypassing npm's workspace system entirely.

## Cloudflare Pages Settings

Go to your Cloudflare Pages project settings and configure:

### Build Configuration
- **Framework preset**: None
- **Build command**: `bash build-web-client.sh`
- **Build output directory**: `apps/web-client/.vercel/output/static`
- **Root directory**: (leave empty - build from repository root)

### Environment Variables
Add any necessary environment variables for your Next.js build (e.g., `NEXT_PUBLIC_*` variables).

## Why This Works
By calling `bash build-web-client.sh` directly instead of `npm run pages:build`, we bypass npm entirely. The shell script handles:
1. Changing to the `apps/web-client` directory
2. Running `npm run build` (which only builds web-client)
3. Running `npx @cloudflare/next-on-pages` to generate Cloudflare-compatible output

## Files Involved
- `build-web-client.sh` - Build script
- `wrangler.toml` - Output directory configuration

## Testing Locally
To test the build locally, run:
```bash
bash build-web-client.sh
```

This will build web-client and generate the Cloudflare Pages output.
