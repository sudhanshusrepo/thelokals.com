# Admin Panel Deployment Steps

## Prerequisites Completed ✅
- Database migrations run (admin_system.sql and admin_seed_data.sql)
- Supabase project configured

## Step-by-Step Deployment Guide

### 1. Create Environment File
Since `.env` is gitignored, create it manually:

```bash
cd packages/admin
```

Create a file named `.env` with:
```env
VITE_SUPABASE_URL=https://gdnltvvxiychrsdzenia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8
```

### 2. Create Admin User in Supabase

1. **Sign up a user** (if not already done):
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" or sign up via the app
   - Note the user's UUID

2. **Grant admin access**:
   - Go to Supabase Dashboard → SQL Editor
   - Run this query (replace with your user UUID):

```sql
INSERT INTO public.admin_users (user_id, role, permissions)
VALUES ('YOUR-USER-UUID-HERE', 'SUPER_ADMIN', '{"all": true}');
```

### 3. Test Locally

```bash
cd packages/admin
npm install
npm run dev
```

Visit `http://localhost:5173` and login with your admin credentials.

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Navigate to admin directory
cd packages/admin

# Deploy
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No**
- Project name? **thelokals-admin** (or your choice)
- Directory? **./packages/admin**
- Override settings? **No**

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `packages/admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://gdnltvvxiychrsdzenia.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
6. Click "Deploy"

### 5. Configure Custom Domain (Optional)

1. In Vercel project → Settings → Domains
2. Add `admin.thelokals.com`
3. Update your DNS:
   - Type: `CNAME`
   - Name: `admin`
   - Value: `cname.vercel-dns.com`

### 6. Security Checklist

- [ ] Verify RLS is enabled on all admin tables
- [ ] Test login with admin user
- [ ] Verify non-admin users cannot access
- [ ] Check audit logs are working
- [ ] Enable 2FA for admin accounts (in Supabase Auth settings)

### 7. Verify Deployment

1. Navigate to your deployed URL
2. Login with admin credentials
3. Check Dashboard loads with stats
4. Test Location Manager:
   - Toggle location status
   - Enable/disable services
   - Verify audit logs appear
5. Check Analytics page

## Troubleshooting

### "Not authorized" error
- Verify user UUID is in `admin_users` table
- Check RLS policies are enabled
- Verify environment variables are correct

### Build fails
- Ensure all dependencies are installed
- Check `package.json` scripts are correct
- Verify TypeScript errors are resolved

### Stats not loading
- Check Supabase connection
- Verify tables have data
- Check browser console for errors

## Next Steps After Deployment

1. **Monitor**: Set up Vercel Analytics
2. **Backup**: Enable Supabase automatic backups
3. **Security**: Review audit logs regularly
4. **Documentation**: Keep admin user list updated

---

**Important**: Never commit `.env` files. Keep admin credentials secure.
