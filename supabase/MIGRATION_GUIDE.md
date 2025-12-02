# Supabase Migration Guide

## Overview
This guide provides step-by-step instructions for running the refactored Supabase migrations. The migrations have been reorganized into 5 logical, sequential files that are error-free and idempotent.

## Migration Files

1. **01_core_schema.sql** - Extensions, Enums, Core Tables (Profiles, Providers, Service Categories)
2. **02_booking_system.sql** - Booking System (Bookings, Lifecycle, Requests, OTP, Reviews)
3. **03_admin_panel.sql** - Admin Panel (Admin Users, Audit Logs, Service Availability)
4. **04_dynamic_pricing.sql** - Dynamic Pricing Engine (Pricing Tables, Analytics)
5. **05_seeds.sql** - Seed Data (Service Categories, Base Prices, Admin User)

## Prerequisites

- Access to Supabase Dashboard
- SQL Editor access in your Supabase project
- Database backup (recommended before running migrations)

## Execution Steps

### Step 1: Backup Your Database (Recommended)
Before running any migrations, create a backup of your database from the Supabase Dashboard.

### Step 2: Open SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 3: Run Migrations in Order

#### Migration 1: Core Schema
1. Open `supabase/migrations/01_core_schema.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify success: You should see "Success. No rows returned"

**What this creates:**
- PostgreSQL extensions (uuid-ossp, postgis)
- Enums (booking_status, payment_status, etc.)
- Core tables (service_categories, profiles, providers)
- Indexes and RLS policies

#### Migration 2: Booking System
1. Open `supabase/migrations/02_booking_system.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run**
5. Verify success

**What this creates:**
- Bookings table with lifecycle extensions
- Booking lifecycle events tracking
- Live booking requests
- Booking OTP system
- Reviews and ratings
- All related functions and triggers

#### Migration 3: Admin Panel
1. Open `supabase/migrations/03_admin_panel.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run**
5. Verify success

**What this creates:**
- Admin users table
- Service availability matrix
- Active sessions tracking
- Admin audit logs (using `admin_id` column)
- RLS policies for admin access

#### Migration 4: Dynamic Pricing
1. Open `supabase/migrations/04_dynamic_pricing.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run**
5. Verify success

**What this creates:**
- Base prices table
- Timing multipliers
- Location zones
- Competitor prices tracking
- Pricing history
- Booking analytics materialized view (with corrected JSONB extraction)

#### Migration 5: Seed Data
1. Open `supabase/migrations/05_seeds.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run**
5. Verify success

**What this creates:**
- 17 service categories
- Base pricing data
- Timing multipliers
- Sample location zones (San Francisco)
- Default admin user (admin@thelokals.com)

### Step 4: Verify Installation

Run the following verification queries in the SQL Editor:

```sql
-- Check table count (should be ~25-30 tables)
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check service categories (should be 17)
SELECT COUNT(*) as category_count 
FROM public.service_categories;

-- Check base prices
SELECT COUNT(*) as price_count 
FROM public.base_prices;

-- Check admin user
SELECT email, role 
FROM public.admin_users;

-- Verify RLS is enabled on all tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
-- Should return 0 rows (all tables should have RLS enabled)
```

## Troubleshooting

### Error: "relation already exists"
**Solution:** The migrations are idempotent and use `IF NOT EXISTS` clauses. This error should not occur, but if it does, it means the table already exists and you can safely ignore it or drop the existing table first.

### Error: "column does not exist"
**Solution:** Ensure you ran the migrations in the correct order (01 → 02 → 03 → 04 → 05).

### Error: "type already exists"
**Solution:** The enum creation is wrapped in `DO $$ BEGIN ... EXCEPTION ... END $$` blocks to handle existing types. This should not cause issues.

### Error: "permission denied"
**Solution:** Ensure you're running the migrations with sufficient database permissions (service_role or postgres role).

## Key Fixes in This Refactor

1. **admin_user_id → admin_id**: Corrected column naming in `admin_audit_logs` table
2. **service_type extraction**: Fixed `booking_analytics` view to extract `service_type` from JSONB `requirements` column
3. **Enum case sensitivity**: All booking status values use uppercase ('COMPLETED', 'CANCELLED')
4. **Idempotent operations**: All migrations use `IF NOT EXISTS`, `DROP IF EXISTS`, and `ON CONFLICT` clauses
5. **Proper dependencies**: Tables are created in the correct order to satisfy foreign key constraints

## Next Steps

After successful migration:

1. **Test Authentication**: Create a test user account
2. **Test Booking Flow**: Create a test booking
3. **Configure Storage**: Set up storage buckets in Supabase Dashboard
4. **Deploy Edge Functions**: Deploy the `calculate-dynamic-price` and other edge functions
5. **Update Environment Variables**: Ensure your frontend has the correct Supabase URL and anon key

## Rollback

If you need to rollback, you can drop all tables in reverse order:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.active_sessions CASCADE;
DROP TABLE IF EXISTS public.service_availability CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.pricing_history CASCADE;
DROP TABLE IF EXISTS public.competitor_prices CASCADE;
DROP TABLE IF EXISTS public.location_zones CASCADE;
DROP TABLE IF EXISTS public.timing_multipliers CASCADE;
DROP TABLE IF EXISTS public.base_prices CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.booking_analytics CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.booking_otp CASCADE;
DROP TABLE IF EXISTS public.live_booking_requests CASCADE;
DROP TABLE IF EXISTS public.booking_lifecycle_events CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.service_categories CASCADE;
```

## Support

If you encounter any issues not covered in this guide, please check:
- Supabase logs in the Dashboard
- PostgreSQL error messages in the SQL Editor
- The original migration files for reference

---

**Migration Version:** 1.0  
**Last Updated:** 2025-12-03  
**Compatible with:** Supabase PostgreSQL 15+
