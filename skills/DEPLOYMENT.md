# Deployment & Credentials

## Database Credentials
**Database Password**: `Dhan@7633881`

## Migration Commands
To apply migrations:
```bash
npx supabase db push
```
(Use the password above when prompted)

## Cloudflare Secrets
Ensure these are set:
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
