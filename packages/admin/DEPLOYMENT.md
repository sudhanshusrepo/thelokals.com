# Admin Panel Deployment Guide

## Prerequisites
- Supabase project set up
- Vercel account
- Domain configured (admin.thelokals.com)

## Step 1: Database Setup

1. Run migrations in order:
```bash
# From project root
cd supabase
supabase db push
```

2. Create admin user:
```sql
-- Sign up first via Supabase Auth Dashboard or API
-- Then get the user UUID and run:
INSERT INTO public.admin_users (user_id, role, permissions)
VALUES ('your-user-uuid-from-auth-users', 'SUPER_ADMIN', '{"all": true}');
```

3. Seed location data:
```bash
# Run the seed migration
psql -h your-supabase-host -U postgres -d postgres -f migrations/20250201000002_admin_seed_data.sql
```

## Step 2: Environment Variables

Create `.env` in `packages/admin`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Build & Test Locally

```bash
cd packages/admin
npm install
npm run dev
# Visit http://localhost:5173
```

## Step 4: Deploy to Vercel

### Option A: Vercel CLI
```bash
cd packages/admin
vercel --prod
```

### Option B: Vercel Dashboard
1. Import repository
2. Set root directory to `packages/admin`
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Step 5: Configure Custom Domain

1. In Vercel project settings → Domains
2. Add `admin.thelokals.com`
3. Update DNS records as instructed

## Step 6: Security Checklist

- [ ] Enable RLS on all admin tables
- [ ] Verify admin_users policies are active
- [ ] Test authentication flow
- [ ] Verify audit logging works
- [ ] Set up IP whitelisting (optional)
- [ ] Enable 2FA for admin accounts (recommended)

## Testing Admin Panel

1. **Login Test**:
   - Navigate to admin.thelokals.com
   - Login with admin credentials
   - Verify dashboard loads

2. **Location Manager Test**:
   - Toggle location status
   - Enable/disable services
   - Check audit logs

3. **Analytics Test**:
   - Verify stats are loading
   - Check real-time updates

## Troubleshooting

### Issue: "Not authorized" error
- Verify user exists in `admin_users` table
- Check RLS policies are enabled
- Verify Supabase URL and key are correct

### Issue: Stats not loading
- Check database connection
- Verify tables have data
- Check browser console for errors

### Issue: Can't login
- Verify user exists in `auth.users`
- Check if user is in `admin_users` table
- Verify Supabase credentials

## Monitoring

- Check Vercel Analytics for traffic
- Monitor Supabase logs for errors
- Review audit logs regularly

## Backup & Recovery

- Supabase automatic backups enabled
- Export audit logs monthly
- Keep admin user list updated

---

**Important**: Keep admin credentials secure. Never commit `.env` files to git.
