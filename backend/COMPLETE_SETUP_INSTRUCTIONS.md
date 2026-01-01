# Complete Database Setup Instructions

## Overview
This guide provides step-by-step instructions for setting up the thelokals.com database from scratch using the consolidated SQL script.

## Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Database connection details (if using external tools)

## ⚠️ IMPORTANT WARNINGS

### This script will:
- **DROP ALL EXISTING TABLES** and their data
- **DELETE ALL EXISTING FUNCTIONS** and triggers
- **REMOVE ALL EXISTING POLICIES**
- **CLEAR ALL CUSTOM TYPES**

### Only run this script if:
- ✅ You are setting up a fresh database
- ✅ You want to completely reset your database
- ✅ You have backed up any important data

### DO NOT run this script if:
- ❌ You have production data you want to keep
- ❌ You are unsure about the consequences
- ❌ You haven't backed up your database

## Setup Steps

### Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query" button

### Step 2: Execute the Setup Script

#### Option A: Copy-Paste Method (Recommended)

1. Open the file: `supabase/complete-database-setup.sql`
2. Select all content (Ctrl+A / Cmd+A)
3. Copy the entire script (Ctrl+C / Cmd+C)
4. Paste into Supabase SQL Editor (Ctrl+V / Cmd+V)
5. Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
6. Wait for execution to complete (may take 30-60 seconds)

#### Option B: File Upload Method

1. In Supabase SQL Editor, look for "Upload SQL file" option
2. Select `supabase/complete-database-setup.sql`
3. Click "Run" to execute
4. Wait for completion

### Step 3: Verify Setup

After the script completes, run these verification queries:

```sql
-- 1. Check table count (should be ~25-30)
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Check function count (should be ~15-20)
SELECT COUNT(*) as function_count 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- 3. Check RLS status (should return 0 rows)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;

-- 4. Check service categories (should be 17)
SELECT COUNT(*) as category_count 
FROM public.service_categories;

-- 5. List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Step 4: Configure Storage (Optional)

If your app uses file uploads, configure storage buckets:

1. Go to "Storage" in Supabase dashboard
2. Create bucket: `avatars` (public)
3. Create bucket: `documents` (private)
4. Set up storage policies as needed

### Step 5: Configure Authentication

1. Go to "Authentication" in Supabase dashboard
2. Enable desired auth providers:
   - Email/Password (recommended)
   - Google OAuth (optional)
   - Phone/SMS (optional)
3. Configure email templates
4. Set up redirect URLs for your frontend

## Expected Results

After successful execution, you should have:

### Tables Created (25+)
- ✅ service_categories
- ✅ profiles
- ✅ providers
- ✅ bookings
- ✅ live_booking_requests
- ✅ booking_otp
- ✅ reviews
- ✅ payment_methods
- ✅ payment_transactions
- ✅ payment_refunds
- ✅ provider_availability
- ✅ provider_earnings
- ✅ provider_notifications
- ✅ provider_stats
- ✅ provider_pins
- ✅ offers
- ✅ user_offers
- ✅ admin_users
- ✅ admin_activity_logs
- ✅ account_deletion_requests
- ✅ user_reports
- ✅ user_blocks

### Functions Created (15+)
- ✅ update_updated_at_column()
- ✅ find_nearby_providers()
- ✅ create_ai_booking()
- ✅ broadcast_live_booking()
- ✅ accept_live_booking()
- ✅ generate_booking_otp()
- ✅ verify_booking_otp()
- ✅ complete_booking()
- ✅ update_provider_rating()
- ✅ request_account_deletion()
- ✅ report_content()
- ✅ block_user()
- ✅ unblock_user()

### Seed Data
- ✅ 17 service categories populated
- ✅ All categories active and ready to use

### Security
- ✅ RLS enabled on all tables
- ✅ Policies configured for user access
- ✅ Function security set to DEFINER where needed

## Troubleshooting

### Error: "relation does not exist"
**Cause**: Script didn't complete fully
**Solution**: Run the script again from the beginning

### Error: "permission denied"
**Cause**: Insufficient database permissions
**Solution**: Ensure you're using the Supabase SQL Editor with admin access

### Error: "syntax error"
**Cause**: Script was modified or corrupted
**Solution**: Re-download the original script from the repository

### Tables exist but no data
**Cause**: Seed data section didn't execute
**Solution**: Run just the seed data section (Part 15) again

### RLS policies not working
**Cause**: Policies may not have been created
**Solution**: Run Part 14 (RLS section) again

## Post-Setup Tasks

### 1. Test User Registration
```sql
-- This should be done via your frontend app
-- Verify a new user creates a profile automatically
```

### 2. Test Provider Registration
```sql
-- Register a provider via your provider app
-- Verify provider record is created
```

### 3. Test Booking Flow
```sql
-- Create a test booking
SELECT create_ai_booking(
  'user-id-here'::uuid,
  'Plumber',
  '{"description": "Fix leaking tap"}'::jsonb,
  ARRAY['Check water pressure', 'Replace washer'],
  500.00,
  ST_GeogFromText('POINT(77.5946 12.9716)'),
  '{"street": "Test St", "city": "Bangalore"}'::jsonb,
  'Test booking'
);
```

### 4. Verify Realtime
```sql
-- Check realtime is enabled for key tables
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## Maintenance

### Regular Backups
- Set up automated backups in Supabase dashboard
- Export data regularly for critical tables
- Keep migration history in version control

### Monitoring
- Monitor table sizes: `SELECT pg_size_pretty(pg_total_relation_size('public.bookings'));`
- Check index usage: `SELECT * FROM pg_stat_user_indexes;`
- Review slow queries in Supabase dashboard

### Updates
- When schema changes are needed, create new migration files
- Test migrations on staging before production
- Keep this consolidated script updated with changes

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review error messages carefully
3. Verify all prerequisites are met
4. Consult Supabase documentation
5. Check project README for additional context

## Next Steps

After successful database setup:
1. ✅ Deploy client application (packages/client)
2. ✅ Deploy provider application (packages/provider)
3. ✅ Deploy mobile app (packages/app)
4. ✅ Configure environment variables
5. ✅ Test end-to-end flows
6. ✅ Set up monitoring and alerts

---

**Setup Date**: 2025-12-01
**Script Version**: 1.0
**Database**: PostgreSQL 15+ with PostGIS
**Supabase**: Compatible with all versions
