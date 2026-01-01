# Cloudflare Pages Build Configuration

## Root Directory
Set to: `apps/web-client`

## Build Command
```bash
npm run pages:build
```

## Build Output Directory
`.vercel/output/static`

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: https://gdnltvvxiychrsdzenia.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [your anon key]

## Notes
- The build command runs `npx @cloudflare/next-on-pages@1` which internally runs `vercel build`
- Vercel CLI expects to be run from the project root (apps/web-client)
- The output is generated in `.vercel/output/static`
