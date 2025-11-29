# Backend Setup Guide

## Step-by-Step Setup Instructions

### Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Supabase project created
- Git repository initialized

### Step 1: Verify Migration Files

All migration files have been created in `supabase/migrations/`:

✅ `20250129000001_core_schema.sql` - Service categories and providers table
✅ `20250129000002_booking_system.sql` - Bookings, live requests, OTP
✅ `20250129000003_reviews_ratings.sql` - Reviews and rating aggregation
✅ `20250129000004_rls_policies.sql` - Row Level Security policies
✅ `20250129000005_functions_triggers.sql` - Database functions
✅ `20250129000006_realtime_setup.sql` - Realtime subscriptions

### Step 2: Link to Supabase Project

```bash
# If not already linked
cd c:\Users\Public\thelokals.com
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Test Locally (Recommended)

```bash
# Start local Supabase instance
supabase start

# This will:
# - Start PostgreSQL database
# - Start Supabase services
# - Apply all migrations automatically
# - Give you local URLs for testing
```

### Step 4: Verify Local Setup

```bash
# Check migration status
supabase migration list

# Access local Studio
# Open: http://localhost:54323
```

### Step 5: Test Database Functions

Run these queries in Supabase Studio SQL Editor:

```sql
-- Test 1: Check service categories
SELECT * FROM public.service_categories;

-- Test 2: Test provider matching function
SELECT * FROM find_nearby_providers(
  ST_GeogFromText('POINT(77.5946 12.9716)'), -- Bangalore coordinates
  'Plumber',
  10
);

-- Test 3: Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Step 6: Deploy to Production

**⚠️ IMPORTANT: Backup first!**

```bash
# Create backup
supabase db dump -f backup_$(date +%Y%m%d).sql --linked

# Deploy migrations
supabase db push --linked

# Verify deployment
supabase migration list --linked
```

### Step 7: Update Application Code

Update your service files to use the new schema:

#### 1. Update `bookingService.ts`
```typescript
// Use new booking creation function
const { data, error } = await supabase.rpc('create_ai_booking', {
  p_client_id: userId,
  p_service_category: category,
  p_requirements: requirements,
  p_ai_checklist: checklist,
  p_estimated_cost: estimatedCost,
  p_location: `POINT(${lng} ${lat})`,
  p_address: address
});
```

#### 2. Update `liveBookingService.ts`
```typescript
// Subscribe to live requests
const channel = supabase
  .channel(`live-requests-${providerId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'live_booking_requests',
      filter: `provider_id=eq.${providerId}`
    },
    handleNewRequest
  )
  .subscribe();
```

#### 3. Update `providerService.ts`
```typescript
// Find nearby providers
const { data, error } = await supabase.rpc('find_nearby_providers', {
  p_location: `POINT(${lng} ${lat})`,
  p_category: category,
  p_max_distance_km: 10
});
```

### Step 8: Enable PostGIS in Supabase Dashboard

1. Go to Supabase Dashboard → Database → Extensions
2. Enable `postgis` extension
3. Verify it's enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

### Step 9: Set Up Cron Job (Optional)

For auto-expiring live requests:

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create new job:
   - Name: `expire-live-requests`
   - Schedule: `*/1 * * * *` (every minute)
   - SQL: `SELECT expire_old_live_requests();`

### Step 10: Test End-to-End

1. **Test AI Booking Flow**
   - Create a booking from client app
   - Verify it appears in database
   - Check AI checklist and estimated cost

2. **Test Live Booking Flow**
   - Broadcast request to providers
   - Provider accepts request
   - Verify booking assignment

3. **Test Provider Dashboard**
   - View incoming requests
   - View assigned bookings
   - Update booking status

4. **Test Reviews**
   - Complete a booking
   - Submit a review
   - Verify provider rating updates

## Troubleshooting

### Migration Fails

```bash
# Reset local database
supabase db reset

# Check migration errors
supabase migration repair --status failed
```

### RLS Policy Issues

```sql
-- Check which policies are blocking
SET ROLE authenticated;
SELECT * FROM public.bookings; -- Test as authenticated user
```

### Geography Type Errors

```sql
-- Verify PostGIS is enabled
SELECT PostGIS_Version();

-- Test geography creation
SELECT ST_GeogFromText('POINT(77.5946 12.9716)');
```

## Rollback Plan

If something goes wrong:

```bash
# Rollback to previous migration
supabase migration repair --status reverted

# Or restore from backup
psql -h YOUR_DB_HOST -U postgres -d postgres < backup_YYYYMMDD.sql
```

## Next Steps

After successful deployment:

1. ✅ Update frontend services to use new schema
2. ✅ Test all booking flows
3. ✅ Monitor database performance
4. ✅ Set up monitoring and alerts
5. ✅ Document API changes for team
