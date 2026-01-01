# Environment Setup Instructions

## Required Environment Variables

To enable all features, you need to configure the following environment variables:

### 1. Create `.env.local` file

Since `.env.local` is gitignored, create it manually in the `apps/web-client` directory:

```bash
cd apps/web-client
cp .env.example .env.local
```

### 2. Add Your Credentials

Edit `.env.local` and add your actual values:

#### Sentry (Error Monitoring)
1. Go to https://sentry.io/
2. Create a new project or use existing
3. Copy your DSN from Settings → Projects → [Your Project] → Client Keys (DSN)
4. Add to `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

#### Google Analytics 4
1. Go to https://analytics.google.com/
2. Create a new GA4 property or use existing
3. Get your Measurement ID (format: G-XXXXXXXXXX)
4. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Verify Setup

```bash
# Type check
npm run type-check

# Build
npm run build

# Run dev server
npm run dev
```

### 4. Test Features

#### Test Sentry
- Trigger an error in the app
- Check Sentry dashboard for the error report

#### Test Analytics
- Open browser DevTools → Network tab
- Look for requests to `google-analytics.com`
- Or use GA4 DebugView: https://analytics.google.com/analytics/web/#/debugview

## Optional: Production Values

For production deployment, set these in your hosting platform (Cloudflare Pages, Vercel, etc.):

```env
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Use production GA4 property
```

## Notes

- `.env.local` is gitignored for security
- Never commit API keys or secrets to git
- Use different Sentry projects/GA4 properties for dev/staging/production
- Sentry and GA4 are optional - the app works without them
