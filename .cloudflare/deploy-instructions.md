# Cloudflare Workers Deployment Guide

## Overview
This guide explains how to deploy your Next.js apps to Cloudflare Workers using standalone mode. This preserves **all Next.js features** including SSR, API routes, and real-time capabilities.

## Why Standalone Mode?

- ✅ **Full Next.js Features**: SSR, ISR, API routes, middleware
- ✅ **Monorepo Compatible**: Works with workspace dependencies
- ✅ **No Build Tool Issues**: Avoids `@cloudflare/next-on-pages` dependency hell
- ✅ **Live Booking Support**: Keeps your real-time features intact

## Deployment Steps

### 1. Build Your App

```bash
# From project root
npm run pages:build:client
```

This creates:
- `.next/standalone` - Standalone server with all dependencies
- `.next/static` - Static assets
- `public` - Public files

### 2. Deploy to Cloudflare Workers

You have two options:

#### Option A: Manual Deploy (Recommended for First Time)

```bash
cd apps/web-client

# Deploy using Wrangler
npx wrangler pages deploy .next/standalone \
  --project-name=thelokals-client \
  --branch=main
```

#### Option B: Automated CI/CD (GitHub Actions)

Create `.github/workflows/deploy-client.yml`:

```yaml
name: Deploy Client to Cloudflare Workers

on:
  push:
    branches: [main]
    paths:
      - 'apps/web-client/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build app
        run: npm run pages:build:client
        
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy apps/web-client/.next/standalone --project-name=thelokals-client
```

### 3. Configure Environment Variables

In Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4. Set Custom Domain (Optional)

1. Workers & Pages → Your Project → Custom Domains
2. Add domain: `app.thelokals.com`
3. Cloudflare will auto-configure DNS

## Deployment for All Apps

### Client App
```bash
npm run pages:build:client
cd apps/web-client
npx wrangler pages deploy .next/standalone --project-name=thelokals-client
```

### Admin App
```bash
npm run pages:build:admin
cd apps/web-admin
npx wrangler pages deploy .next/standalone --project-name=thelokals-admin
```

### Provider App
```bash
npm run pages:build:provider
cd apps/web-provider
npx wrangler pages deploy .next/standalone --project-name=thelokals-provider
```

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure workspace dependencies are built first:
```bash
npm run build --workspace=@thelocals/platform-core
```

### Issue: Environment variables not working
**Solution**: Prefix client-side vars with `NEXT_PUBLIC_` and add them in Cloudflare Dashboard

### Issue: API routes returning 404
**Solution**: Ensure `output: 'standalone'` is in `next.config.js`

## What You Get

✅ **Server-Side Rendering (SSR)** - Dynamic pages render on-demand  
✅ **API Routes** - `/api/*` routes work as Cloudflare Workers  
✅ **Incremental Static Regeneration (ISR)** - Best of both worlds  
✅ **Middleware** - Auth checks, redirects, etc.  
✅ **Real-time Features** - Supabase Realtime channels work perfectly  
✅ **Edge Performance** - 300+ global locations  
✅ **Unlimited Bandwidth** - No overage charges  

## Performance

- **TTFB**: <50ms globally (Cloudflare's edge network)
- **Cold Start**: ~100ms (Workers are fast!)
- **Bandwidth**: Unlimited on all plans
- **Requests**: 100,000/day on free tier

## Cost

- **Free Tier**: 100,000 requests/day
- **Paid Plans**: $5/month for 10M requests
- **No Bandwidth Charges**: Unlike Vercel

## Next Steps

1. Test locally: `npm run dev:client`
2. Build: `npm run pages:build:client`
3. Deploy: Follow steps above
4. Monitor: Cloudflare Dashboard → Analytics

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
