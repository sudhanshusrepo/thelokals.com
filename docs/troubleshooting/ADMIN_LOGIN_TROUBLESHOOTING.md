# Admin Panel Login Troubleshooting Guide

## Error: 400 Bad Request on Login

You're seeing this error when trying to login to the admin panel:
```
POST https://gdnltvvxiychrsdzenia.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

## Common Causes & Solutions

### 1. Email Confirmation Required (Most Likely)

**Problem**: Supabase requires email confirmation by default for new users.

**Solution A - Disable Email Confirmation** (Recommended for development):

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll down to **"Confirm email"**
4. **Uncheck** "Enable email confirmations"
5. Click **Save**

**Solution B - Confirm the Email**:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user
3. Click the three dots (•••) → **"Send magic link"** or manually verify
4. Or directly update in SQL Editor:
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'your-email@example.com';
   ```

### 2. Incorrect Credentials

**Check**:
- Email is correct
- Password is correct (case-sensitive)
- User exists in Supabase Auth

**Verify User Exists**:
```sql
-- Run in Supabase SQL Editor
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

### 3. User Not in admin_users Table

Even if the user can authenticate, they need to be in the `admin_users` table.

**Check**:
```sql
SELECT * FROM public.admin_users;
```

**Add Admin User** (if missing):
```sql
-- First, get the user UUID from auth.users
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert into admin_users
INSERT INTO public.admin_users (user_id, role, permissions)
VALUES ('user-uuid-from-above', 'SUPER_ADMIN', '{"all": true}');
```

### 4. RLS Policies Blocking Access

**Verify RLS is set up correctly**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- Check policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'admin_users';
```

## Step-by-Step Fix (Recommended)

### Step 1: Disable Email Confirmation
1. Supabase Dashboard → Authentication → Providers → Email
2. Uncheck "Enable email confirmations"
3. Save

### Step 2: Create Test Admin User

1. **Sign up a new user** (or use existing):
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User"
   - Email: `admin@thelokals.com` (or your email)
   - Password: `Admin@123` (or your choice)
   - Auto Confirm User: **YES** ✅
   - Click "Create User"

2. **Note the User UUID** (copy it)

3. **Add to admin_users table**:
   ```sql
   -- Run in SQL Editor
   INSERT INTO public.admin_users (user_id, role, permissions)
   VALUES ('paste-user-uuid-here', 'SUPER_ADMIN', '{"all": true}')
   ON CONFLICT (user_id) DO NOTHING;
   ```

### Step 3: Test Login

1. Go to your admin panel (localhost:5173 or deployed URL)
2. Login with:
   - Email: `admin@thelokals.com`
   - Password: `Admin@123`

## Verify Everything is Set Up

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check if migrations ran
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_users', 'location_configs', 'admin_audit_logs');

-- 2. Check admin users
SELECT au.user_id, au.role, u.email, u.email_confirmed_at
FROM public.admin_users au
JOIN auth.users u ON u.id = au.user_id;

-- 3. Check location configs
SELECT id, name, is_active FROM public.location_configs;
```

Expected results:
- Query 1: Should return 3 tables
- Query 2: Should show your admin user with email confirmed
- Query 3: Should show locations (Gurugram, Delhi, Noida, Faridabad)

## Still Having Issues?

### Check Browser Console

Look for more detailed error messages:
```javascript
// The error object should contain more details
{
  "error": "invalid_grant",
  "error_description": "Email not confirmed"
}
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Auth Logs**
3. Look for failed login attempts
4. Check the error message

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Email not confirmed` | Email verification required | Disable email confirmation or verify email |
| `Invalid login credentials` | Wrong email/password | Check credentials |
| `User not found` | User doesn't exist | Create user in Supabase Auth |
| `Too many requests` | Rate limited | Wait a few minutes |

## Quick Test Script

Run this in your browser console on the admin login page:

```javascript
// Test Supabase connection
const { createClient } = supabase;
const supabaseUrl = 'https://gdnltvvxiychrsdzenia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8';

const client = createClient(supabaseUrl, supabaseKey);

// Test auth
const { data, error } = await client.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

console.log('Auth result:', { data, error });
```

---

**Most Likely Fix**: Disable email confirmation in Supabase Auth settings and ensure your user is in the `admin_users` table.
