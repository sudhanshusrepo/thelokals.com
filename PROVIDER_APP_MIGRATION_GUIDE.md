# Provider App v1.0 - Database Migration Guide

## Migration File
`supabase/migrations/20250130000003_provider_app_v1.sql`

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)

1. **Login to Supabase**:
   ```bash
   npx supabase login
   ```

2. **Link to your project**:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Push the migration**:
   ```bash
   npx supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of `20250130000003_provider_app_v1.sql`
5. Click **Run** to execute the migration

### Option 3: Using Direct Database Connection

1. Get your database connection string from Supabase Dashboard
2. Use `psql` or any PostgreSQL client:
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" < supabase/migrations/20250130000003_provider_app_v1.sql
   ```

## What This Migration Does

### 1. Updates `providers` Table
- Adds `registration_status` column (unregistered/pending/verified/rejected)
- Adds `registration_completed_at` timestamp
- Adds `digilocker_verified` boolean
- Adds `profile_photo_verified` boolean
- Adds `rejection_reason` text
- Updates existing providers to 'verified' status

### 2. Creates `provider_notifications` Table
- Stores all notifications for providers
- Supports types: booking_request, booking_update, payment, system, promotion
- Includes read/unread tracking
- Has action URLs for navigation

### 3. Creates `provider_pins` Table
- Allows providers to pin/favorite bookings or clients
- Supports notes on pins
- Ensures either booking OR client is pinned (not both)

### 4. Creates `provider_push_tokens` Table
- Stores push notification tokens
- Supports iOS, Android, and Web platforms
- Tracks last usage

### 5. Creates Helper Functions
- `can_accept_bookings(provider_uuid)` - Check if provider can accept bookings
- `create_provider_notification()` - Create notifications
- `mark_notification_read()` - Mark notifications as read
- `get_unread_notification_count()` - Get unread count

### 6. Creates Triggers
- Auto-create notification on new booking (PENDING status)
- Auto-create notification on booking status change

### 7. Sets Up RLS Policies
- Providers can only see their own notifications
- Providers can only manage their own pins
- Providers can only manage their own push tokens

### 8. Enables Realtime
- Adds `provider_notifications` to realtime publication
- Adds `provider_pins` to realtime publication

## Verification

After applying the migration, verify it worked:

```sql
-- Check if new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'providers' 
AND column_name IN ('registration_status', 'digilocker_verified');

-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('provider_notifications', 'provider_pins', 'provider_push_tokens');

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('can_accept_bookings', 'create_provider_notification');
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trigger_notify_provider_new_booking ON public.bookings;
DROP TRIGGER IF EXISTS trigger_notify_provider_booking_update ON public.bookings;

-- Drop functions
DROP FUNCTION IF EXISTS notify_provider_new_booking_request();
DROP FUNCTION IF EXISTS notify_provider_booking_update();
DROP FUNCTION IF EXISTS can_accept_bookings(UUID);
DROP FUNCTION IF EXISTS create_provider_notification(UUID, TEXT, TEXT, TEXT, JSONB, TEXT);
DROP FUNCTION IF EXISTS mark_notification_read(UUID);
DROP FUNCTION IF EXISTS get_unread_notification_count(UUID);

-- Drop tables
DROP TABLE IF EXISTS public.provider_push_tokens;
DROP TABLE IF EXISTS public.provider_pins;
DROP TABLE IF EXISTS public.provider_notifications;

-- Remove columns from providers table
ALTER TABLE public.providers 
DROP COLUMN IF EXISTS registration_status,
DROP COLUMN IF EXISTS registration_completed_at,
DROP COLUMN IF EXISTS digilocker_verified,
DROP COLUMN IF EXISTS profile_photo_verified,
DROP COLUMN IF EXISTS rejection_reason;
```

## Next Steps

After applying the migration:

1. ✅ Test the provider registration flow
2. ✅ Verify real-time subscriptions work
3. ✅ Test notification creation
4. ✅ Test booking request flow
5. ✅ Verify RLS policies are working correctly

## Troubleshooting

### Error: "relation already exists"
- The migration is idempotent and uses `IF NOT EXISTS` clauses
- Safe to re-run if it fails partway through

### Error: "permission denied"
- Ensure you're connected as a superuser or have sufficient privileges
- Check your Supabase project permissions

### Realtime not working
- Verify the tables are added to the publication:
  ```sql
  SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
  ```

## Support

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Ensure you have the latest Supabase CLI version
4. Check the migration file for syntax errors
